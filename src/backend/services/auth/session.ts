import "server-only";
// Session cookie: a signed, non-encrypted payload holding only what a TenantContext needs.
// The signature is ours, not the auth provider's, so swapping identity providers does not change sessions.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { config } from "@/backend/config";

const SessionPayloadSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().min(1),
  role: z.enum(["owner", "manager", "viewer"]),
  locationId: z.string().min(1).nullable().optional(),
  expiresAt: z.number().int().positive(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

function sign(body: string): string {
  return createHmac("sha256", config.session.secret).update(body).digest("base64url");
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  const parsed = SessionPayloadSchema.safeParse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
  if (!parsed.success || parsed.data.expiresAt < Date.now()) return null;
  return parsed.data;
}

export async function writeSession(payload: Omit<SessionPayload, "expiresAt">): Promise<void> {
  const expiresAt = Date.now() + config.session.maxAgeSeconds * 1000;
  const store = await cookies();
  store.set(config.session.cookieName, encode({ ...payload, expiresAt }), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    path: "/",
    maxAge: config.session.maxAgeSeconds,
  });
}

/** Switches the active location, keeping everything else about the session as it is. */
export async function setSessionLocation(locationId: string): Promise<void> {
  const current = await readSession();
  if (!current) return;
  const { expiresAt: _expiresAt, ...rest } = current;
  await writeSession({ ...rest, locationId });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(config.session.cookieName)?.value;
  if (!token) return null;
  try {
    return decode(token);
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(config.session.cookieName);
}
