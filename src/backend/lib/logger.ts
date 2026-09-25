import "server-only";
// Structured logging. Never log personal data, tokens or full vendor responses — ids and summaries only.

type Level = "debug" | "info" | "warn" | "error";

type LogFields = {
  message: string;
  organizationId?: string;
  scanId?: string;
  provider?: string;
  durationMs?: number;
  [key: string]: unknown;
};

function write(level: Level, fields: LogFields): void {
  const line = JSON.stringify({ level, at: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (fields: LogFields) => write("debug", fields),
  info: (fields: LogFields) => write("info", fields),
  warn: (fields: LogFields) => write("warn", fields),
  error: (fields: LogFields) => write("error", fields),
};
