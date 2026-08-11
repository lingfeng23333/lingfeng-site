import { spawn } from "node:child_process";
import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";

const PY = "D:\\codex-venvs\\qwen-mm-plugins\\venv\\Scripts\\python.exe";
const PLUGIN_ROOT =
  "C:\\Users\\zorro\\.codex\\plugins\\cache\\qwen-mm-plugins\\qwen-mm-plugins-core\\1.0.0";

const imagePath = process.argv[2];
const budget = process.argv[3] || "normal";

if (!imagePath) {
  console.error("usage: node mcp_read_image.mjs <image_path> [budget]");
  process.exit(1);
}

const absImage = path.resolve(imagePath);
const outPath = path.join(
  path.dirname(absImage),
  `${path.basename(absImage, path.extname(absImage))}_read.png`,
);

const child = spawn(PY, ["-m", "qwen_mm_plugins_core"], {
  cwd: PLUGIN_ROOT,
  stdio: ["pipe", "pipe", "pipe"],
});

const rl = readline.createInterface({ input: child.stdout });
let buffer = "";
let settled = false;

function send(obj) {
  child.stdin.write(JSON.stringify(obj) + "\n");
}

function finish(code) {
  if (settled) return;
  settled = true;
  try {
    child.stdin.end();
  } catch {}
  setTimeout(() => {
    child.kill();
    process.exit(code);
  }, 200);
}

const timer = setTimeout(() => {
  console.error("timeout waiting for read_image response");
  finish(1);
}, 90000);

rl.on("line", (line) => {
  buffer += line;
  let parsed = null;
  try {
    parsed = JSON.parse(buffer);
    buffer = "";
  } catch {
    return;
  }

  if (parsed.id === 1 && parsed.result) {
    send({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });
    send({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "read_image",
        arguments: { image_path: absImage, budget },
      },
    });
    return;
  }

  if (parsed.id === 2) {
    clearTimeout(timer);
    const result = parsed.result || {};
    const content = Array.isArray(result.content) ? result.content : [];
    for (const item of content) {
      if (item.type === "text") {
        console.log(item.text);
      } else if (item.type === "image" && item.data) {
        fs.writeFileSync(outPath, Buffer.from(item.data, "base64"));
        console.log(`WROTE ${outPath} (${fs.statSync(outPath).size} bytes)`);
      }
    }
    if (parsed.error) console.error(JSON.stringify(parsed.error));
    finish(0);
  }
});

child.stderr.on("data", (d) => {
  process.stderr.write(d);
});

send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "codex", version: "1.0" },
  },
});
