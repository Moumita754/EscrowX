const isDev = import.meta.env.DEV;

const styles: Record<string, string> = {
  start: "color:#818cf8;font-weight:bold",
  ok: "color:#34d399;font-weight:bold",
  warn: "color:#fbbf24;font-weight:bold",
  error: "color:#f87171;font-weight:bold",
  info: "color:#22d3ee",
};

const stamp = () => new Date().toISOString().slice(11, 23);

const emit = (kind: keyof typeof styles, scope: string, msg: string, data?: unknown) => {
  if (!isDev) return;
  const prefix = `%c[${stamp()}] [EscrowX:${scope}] ${msg}`;
  if (data !== undefined) {
    console.log(prefix, styles[kind], data);
  } else {
    console.log(prefix, styles[kind]);
  }
};

/** Lightweight, dev-only structured logger used across the escrow pipeline. */
export const logger = {
  start: (scope: string, msg: string, data?: unknown) => emit("start", scope, `▶ ${msg}`, data),
  step: (scope: string, msg: string, data?: unknown) => emit("info", scope, `· ${msg}`, data),
  ok: (scope: string, msg: string, data?: unknown) => emit("ok", scope, `✓ ${msg}`, data),
  warn: (scope: string, msg: string, data?: unknown) => emit("warn", scope, `! ${msg}`, data),
  error: (scope: string, msg: string, error?: unknown) => {
    if (!isDev) return;
    console.error(`%c[${stamp()}] [EscrowX:${scope}] ✗ ${msg}`, styles.error, error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  },
};
