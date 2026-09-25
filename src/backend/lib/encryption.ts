import "server-only";
// Symmetric encryption for values stored at rest (OAuth tokens). AES-256-GCM with a key derived from config.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { config } from "@/backend/config";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function key(): Buffer {
  return createHash("sha256").update(config.encryptionKey).digest();
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, ciphertext] = payload.split(".");
  if (!iv || !tag || !ciphertext) throw new Error("Malformed encrypted payload");
  const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}
