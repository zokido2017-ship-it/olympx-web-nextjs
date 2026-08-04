const fs = require("fs");
const path = require("path");

const jsonl = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-lenovo-Desktop-NextjsProject/agent-transcripts/1c43c089-ed05-4502-9571-76f398ace945/1c43c089-ed05-4502-9571-76f398ace945.jsonl",
);
const root = path.join(__dirname, "..");

const files = new Map();

for (const line of fs.readFileSync(jsonl, "utf8").split("\n")) {
  if (!line.includes('"Write"')) continue;
  let row;
  try {
    row = JSON.parse(line);
  } catch {
    continue;
  }
  for (const part of row.message?.content || []) {
    if (part.type !== "tool_use" || part.name !== "Write") continue;
    const inp = part.input || {};
    const filePath = String(inp.path || "").replace(/\\/g, "/");
    if (!filePath.includes("NextjsProject/src/") || !inp.contents) continue;
    files.set(filePath, inp.contents);
  }
}

for (const [filePath, contents] of files) {
  const rel = filePath.split("NextjsProject/")[1];
  if (!rel) continue;
  const out = path.join(root, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, contents, "utf8");
}

console.log(`Restored ${files.size} files under src/`);
