// Structured logging utility
// Replaces console.log with consistent, timestamped output
// In production, could be swapped for Winston/Pino

type LogLevel = "debug" | "info" | "warn" | "error";

function format(level: LogLevel, message: string, meta?: Record<string, any>): string {
  const ts = new Date().toISOString();
  const metaStr = meta ? " " + JSON.stringify(meta) : "";
  return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  debug: (msg: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") console.log(format("debug", msg, meta));
  },
  info: (msg: string, meta?: Record<string, any>) => console.log(format("info", msg, meta)),
  warn: (msg: string, meta?: Record<string, any>) => console.warn(format("warn", msg, meta)),
  error: (msg: string, meta?: Record<string, any>) => console.error(format("error", msg, meta)),
};

