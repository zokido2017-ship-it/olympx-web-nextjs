#!/usr/bin/env bash
# Production process for systemd. Bind to loopback; nginx is the public edge.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

HOST="${LISTEN_HOST:-127.0.0.1}"
PORT="${PORT:-3000}"

if [[ ! -x "$ROOT/node_modules/next/dist/bin/next" && ! -f "$ROOT/node_modules/next/dist/bin/next" ]]; then
  echo "next is not installed. Run: npm ci && npm run build" >&2
  exit 1
fi

NODE_BIN="${NODE_BIN:-$(command -v node)}"
exec "$NODE_BIN" "$ROOT/node_modules/next/dist/bin/next" start -H "$HOST" -p "$PORT"
