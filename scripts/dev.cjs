"use strict";

/**
 * Runs `next dev` with Node 20+. If PATH points at an older Node, tries common
 * Windows install paths and nvm-windows (`NVM_HOME`) before failing.
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

/** Prefer newest Node ≥ 20 under nvm-windows (`NVM_HOME\v*\node.exe`). */
function findNvmNode20Plus() {
  const nvmHome = process.env.NVM_HOME;
  if (!nvmHome || !fs.existsSync(nvmHome)) return null;
  let bestExe = null;
  let bestMajor = 0;
  let entries;
  try {
    entries = fs.readdirSync(nvmHome, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (!/^v\d+/.test(ent.name)) continue;
    const exe = path.join(nvmHome, ent.name, "node.exe");
    if (!fs.existsSync(exe)) continue;
    const ver = nodeVersionOf(exe);
    const maj = majorOf(ver || "");
    if (maj >= 20 && maj >= bestMajor) {
      bestMajor = maj;
      bestExe = exe;
    }
  }
  return bestExe;
}

function collectWindowsNodeCandidates() {
  const list = [
    path.join(process.env.ProgramFiles || "C:\\Program Files", "nodejs", "node.exe"),
    "C:\\Program Files\\nodejs\\node.exe",
    path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "nodejs", "node.exe"),
    "C:\\Program Files (x86)\\nodejs\\node.exe",
  ];
  const nvm = findNvmNode20Plus();
  if (nvm) list.push(nvm);
  return list;
}

const currentMajor = majorOf(process.version);

if (currentMajor >= 20) {
  runNextDev(process.execPath);
}

if (process.platform === "win32") {
  for (const exe of collectWindowsNodeCandidates()) {
    if (!exe || !fs.existsSync(exe)) continue;
    const v = nodeVersionOf(exe);
    if (v && majorOf(v) >= 20) {
      console.error(
        `[dev] Using Node ${v} from:\n      ${exe}\n      (PATH had ${process.version})\n`,
      );
      runNextDev(exe);
    }
  }
}

fail(
  [
    "",
    'This app requires Node.js 20 or newer (see package.json "engines").',
    `Invoked with: ${process.version} (${process.execPath})`,
    "",
    "Fix options:",
    "  • Install Node 20 LTS from https://nodejs.org and restart the terminal.",
    "  • Or with nvm-windows: nvm install 20 && nvm use 20",
    "  • Then run `where node` and ensure Node 20 appears first.",
    "",
  ].join("\n"),
);
