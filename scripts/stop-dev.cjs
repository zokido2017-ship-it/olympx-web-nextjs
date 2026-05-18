"use strict";

/**
 * Frees the default Next dev port (3000) so `npm run dev` can start cleanly
 * after a stuck process or "Another next dev server is already running" situation.
 *
 * Windows: uses netstat + taskkill. Unix: uses lsof + kill.
 */
const { execSync, spawnSync } = require("child_process");

const DEFAULT_PORT = process.env.PORT || "3000";
const port = Number.parseInt(String(DEFAULT_PORT), 10) || 3000;

function killWindowsListeners(listenPort) {
  let out;
  try {
    out = execSync("netstat -ano", { encoding: "utf8" });
  } catch {
    return;
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || !/LISTENING/i.test(trimmed)) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 5) continue;
    const local = parts[1];
    const state = parts[3];
    if (!local || !state || !/LISTENING/i.test(state)) continue;
    const portSuffix = `:${listenPort}`;
    if (!local.endsWith(portSuffix)) continue;
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) pids.add(pid);
  }
  for (const pid of pids) {
    try {
      spawnSync("taskkill", ["/PID", pid, "/F"], {
        stdio: "inherit",
        shell: false,
      });
    } catch {
      /* already gone */
    }
  }
}

function killUnixListeners(listenPort) {
  let out;
  try {
    out = execSync(`lsof -nP -iTCP:${listenPort} -sTCP:LISTEN -t`, {
      encoding: "utf8",
    });
  } catch {
    return;
  }
  const pids = out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
  for (const pid of pids) {
    try {
      spawnSync("kill", ["-9", pid], { stdio: "pipe" });
    } catch {
      /* ignore */
    }
  }
}

console.log(`[stop-dev] freeing port ${port}…`);
if (process.platform === "win32") {
  killWindowsListeners(port);
} else {
  killUnixListeners(port);
}
console.log("[stop-dev] done.");
