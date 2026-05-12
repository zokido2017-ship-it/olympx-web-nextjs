"use strict";

/**
 * ESLint 9 + eslint-config-next expect Node ≥18 (`structuredClone` global).
 * Some terminals (e.g. PATH with older Node before the system Node 20 install)
 * invoke `npm run lint` with Node 16; polyfill avoids a cryptic ESLint crash.
 */
if (typeof globalThis.structuredClone !== "function") {
  const mod = require("@ungap/structured-clone");
  globalThis.structuredClone =
    typeof mod === "function" ? mod : mod.default;
}
