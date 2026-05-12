"use strict";

/** Next.js 16 requires Node ≥ 20; fail early with an actionable message. */
var match = /^v(\d+)/.exec(process.version);
var major = match ? Number.parseInt(match[1], 10) : 0;

if (!Number.isFinite(major) || major < 20) {
  console.error(
    "\nThis app requires Node.js 20 or newer (see package.json \"engines\").",
    "\nYour version:",
    process.version,
    '\nInstall Node 20+ and ensure it appears first in PATH for this terminal (Windows: check `where node`).\n',
  );
  process.exit(1);
}
