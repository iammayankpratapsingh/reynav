import "server-only";
// Routes map errors to status codes here, in one place. Users see a plain-language message; details go to logs.
import { isAppError, type AppErrorCode } from "@/shared/errors";
import { logger } from "./logger";

const statusByCode: Record<AppErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  not_found: 404,
  rate_limited: 429,
  auth_expired: 409,
  quota_exhausted: 402,
  provider_unavailable: 503,
  config: 500,
};

export function toErrorResponse(error: unknown): Response {
  if (isAppError(error)) {
    logger.warn({ message: "request failed", code: error.code, detail: error.message });
    return Response.json({ error: error.userMessage, code: error.code }, { status: statusByCode[error.code] });
  }

  logger.error({ message: "unhandled request error", detail: String(error) });
  return Response.json({ error: "Something went wrong.", code: "unknown" }, { status: 500 });
}
