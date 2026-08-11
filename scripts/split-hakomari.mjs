import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "resources", "hakomari");
const chaptersDir = path.join(dir, "chapters");
const CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const TARGET = 12000;
const MIN_MARKER_SPLIT = 5000;
const MIN_PART = 1500;
const MARKER = /^第[一二三四五六七八九十百0-9]+次$/;

const files = ["01.md", "02.md", "03.md", "04.md", "05.md", "06.md", "07.md"];

// 先全部读进内存，避免边读边写覆盖源文件
const sources = files.map((file) => ({
  file,
  volNum: Number(file.slice(0, 2)),
  content: fs
    .readFileSync(path.join(chaptersDir, file), "utf8")
    .replace(/\r\n/g, "\n"),
}));

const newChapters = [];
let seq = 0;

for (const src of sources) {
  const cn = CN[src.volNum];
  const paragraphs = src.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const parts = [];
  let current = [];
  let size = 0;

  const flush = () => {
    if (current.length > 0) {
      parts.push(current);
      current = [];
      size = 0;
    }
  };

  for (const p of paragraphs) {
    if (p === "## 插图") continue;

    const isMarker = MARKER.test(p);
    const isAfterword = p === "## 后记";

    if (isAfterword) {
      flush();
      current.push("## 后记");
      size += 10;
      continue;
    }

    if (
      isMarker &&
      current.length > 0 &&
      size >= MIN_MARKER_SPLIT &&
      current[current.length - 1] !== p
    ) {
      flush();
    }

    current.push(p);
    size += p.length;
    if (size >= TARGET) flush();
  }
  flush();

  // 合并过小的分页
  for (let i = 0; i < parts.length; i++) {
    const partSize = parts[i].join("\n\n").length;
    if (partSize >= MIN_PART) continue;
    if (i + 1 < parts.length) {
      parts[i + 1] = [...parts[i], "", ...parts[i + 1]];
      parts.splice(i, 1);
      i--;
    } else if (i > 0) {
      parts[i - 1] = [...parts[i - 1], "", ...parts[i]];
      parts.splice(i, 1);
      i--;
    }
  }

  for (let pi = 0; pi < parts.length; pi++) {
    seq++;
    const num = String(seq).padStart(2, "0");
    const paras = parts[pi];
    const markers = paras.filter((p) => MARKER.test(p));
    let title;
    if (markers.length === 1) {
      title = `第${cn}卷 · ${markers[0]}`;
    } else if (markers.length > 1) {
      title = `第${cn}卷 · ${markers[0]}起`;
    } else {
      title = `第${cn}卷 · 第${pi + 1}节`;
    }
    const md = paras.join("\n\n");
    fs.writeFileSync(path.join(chaptersDir, `${num}.md`), `${md}\n`, "utf8");
    newChapters.push({ number: num, file: `${num}.md`, title });
    console.log(`${num} ${title} (${md.length} chars)`);
  }
}

const metaPath = path.join(dir, "meta.json");
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
meta.chapters = newChapters;
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf8");
console.log(`total ${newChapters.length} chapters`);
