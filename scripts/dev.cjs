"use strict";

/**
 * Runs `next dev` with Node 20+. If PATH points at an older Node, tries the
 * standard Windows Node.js install path before failing.
 */
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

function majorOf(versionString) {
  const m = /^v?(\d+)/.exec(String(versionString).trim());
  return m ? Number.parseInt(m[1], 10) : 0;
}

function nodeVersionOf(exe) {
  try {
    return execFileSync(exe, ["-p", "process.version"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function runNextDev(nodeExe) {
  const extra = process.argv.slice(2);
  // Turbopack can panic on Windows when spawning PostCSS (Tailwind v4) — IPC stream closes.
  // Webpack dev avoids that path until upstream fixes land.
  const args =
    process.platform === "win32"
      ? [nextBin, "dev", "--webpack", ...extra]
      : [nextBin, "dev", ...extra];
  const env = { ...process.env };
  if (!/\bmax-old-space-size=/.test(env.NODE_OPTIONS || "")) {
    env.NODE_OPTIONS = [env.NODE_OPTIONS, "--max-old-space-size=8192"]
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  const r = spawnSync(nodeExe, args, {
    stdio: "inherit",
    cwd: projectRoot,
    env,
    shell: false,
  });
  process.exit(typeof r.status === "number" ? r.status : 1);
}

const currentMajor = majorOf(process.version);

if (currentMajor >= 20) {
  runNextDev(process.execPath);
}

if (process.platform === "win32") {
  const candidates = [
    path.join(process.env.ProgramFiles || "C:\\Program Files", "nodejs", "node.exe"),
    "C:\\Program Files\\nodejs\\node.exe",
  ];
  for (const exe of candidates) {
    if (!exe || !fs.existsSync(exe)) continue;
    const v = nodeVersionOf(exe);
    if (v && majorOf(v) >= 20) {
      runNextDev(exe);
    }
  }
}

fail(
  [
    "",
    'This app requires Node.js 20 or newer (see package.json "engines").',
    `Invoked with: ${process.version} (${process.execPath})`,
    "Install Node 20+ and put it first in PATH (Windows: check `where node`).",
    "",
  ].join("\n"),
);
