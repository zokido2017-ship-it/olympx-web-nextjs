"use strict";

/** Next.js 16 requires Node ≥ 20; fail early with an actionable message. */
var match = /^v(\d+)/.exec(process.version);
var major = match ? Number.parseInt(match[1], 10) : 0;

if (!Number.isFinite(major) || major < 20) {
  console.error(
    "\nThis app requires Node.js 20 or newer (see package.json \"engines\").",
    "\nYour version:",
    process.version,
    "\n\nFix:",
    "\n  • Install Node 20+ from https://nodejs.org (LTS), or",
    "\n  • nvm-windows: nvm install 20 && nvm use 20",
    "\n  • Windows: run `where node` — the first path should be Node 20+.",
    "\n",
  );
  process.exit(1);
}
