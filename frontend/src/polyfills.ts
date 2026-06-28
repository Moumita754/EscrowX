// Browser polyfills for Node.js globals that @stellar/stellar-sdk expects.
//
// The SDK references `Buffer` and `global`, which exist in Node but not in the
// browser. Vite's dev server shims these, but the production build does not, so
// without this the app throws "Buffer is not defined" / "global is not defined"
// on load and renders a blank screen.
//
// This module is imported FIRST in main.tsx so it runs before any SDK code.
import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}
// `global` is also aliased to `globalThis` at build time via vite.config.ts.
if (typeof (globalThis as { global?: unknown }).global === "undefined") {
  (globalThis as { global?: unknown }).global = globalThis;
}
