// Our error classes: RateLimited, AuthExpired, NotFound, ProviderUnavailable, QuotaExhausted, Validation, Config.
// Adapters normalise every vendor error into one of these. Callers never catch a vendor-specific error.

export type AppErrorCode =
  | "rate_limited"
  | "auth_expired"
  | "unauthorized"
  | "not_found"
  | "provider_unavailable"
  | "quota_exhausted"
  | "validation"
  | "config";

export class AppError extends Error {
  readonly code: AppErrorCode;
  /** Plain-language message safe to show a customer. */
  readonly userMessage: string;

  constructor(code: AppErrorCode, message: string, userMessage: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.userMessage = userMessage;
  }
}

export class RateLimitedError extends AppError {
  constructor(message: string, readonly retryAfterMs?: number) {
    super("rate_limited", message, "We are being throttled by a provider. Please try again shortly.");
  }
}

export class AuthExpiredError extends AppError {
  constructor(message: string) {
    super("auth_expired", message, "This connection needs to be reconnected.");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, userMessage = "Please sign in to continue.") {
    super("unauthorized", message, userMessage);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super("not_found", message, "We could not find that.");
  }
}

export class ProviderUnavailableError extends AppError {
  constructor(message: string) {
    super("provider_unavailable", message, "A service we rely on is unavailable. Please try again soon.");
  }
}

export class QuotaExhaustedError extends AppError {
  constructor(message: string) {
    super("quota_exhausted", message, "You have used everything included in your plan this period.");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage = "Please check the details you entered.") {
    super("validation", message, userMessage);
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super("config", message, "The application is misconfigured.");
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
