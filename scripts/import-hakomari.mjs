import AdmZip from "adm-zip";
import TurndownService from "turndown";
import fs from "node:fs";
import path from "node:path";

const SRC =
  "G:/xiazai/【批量下载】御影瑛路 - 虚空之盒与零之麻理亚01等/虚空之盒与零之麻理亚【御影瑛路】";
const RES_ID = "hakomari";

const dataDir = path.join(process.cwd(), "data", "resources", RES_ID);
const chaptersDir = path.join(dataDir, "chapters");
const imgDir = path.join(process.cwd(), "public", "resources", RES_ID, "img");
fs.mkdirSync(chaptersDir, { recursive: true });
fs.mkdirSync(imgDir, { recursive: true });

const turndown = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  emDelimiter: "*",
  strongDelimiter: "**",
  codeBlockStyle: "fenced",
});
turndown.remove(["script", "style", "title"]);

const CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

function readEntry(zip, entryName) {
  const entry = zip.getEntry(entryName);
  if (!entry) return null;
  return entry.getData().toString("utf8");
}

function parseOpf(zip, opfEntryName) {
  const xml = readEntry(zip, opfEntryName);
  const manifest = new Map();
  for (const m of xml.matchAll(/<item\s+([^>]*?)\/?>/g)) {
    const attrs = m[1];
    const id = /id="([^"]+)"/.exec(attrs)?.[1];
    const href = /href="([^"]+)"/.exec(attrs)?.[1];
    const media = /media-type="([^"]+)"/.exec(attrs)?.[1];
    if (id && href) manifest.set(id, { href, media });
  }
  const spine = [...xml.matchAll(/<itemref\s+([^>]*?)\/?>/g)]
    .map((m) => /idref="([^"]+)"/.exec(m[1])?.[1])
    .filter(Boolean);
  const baseDir = path.posix.dirname(opfEntryName);
  return { manifest, spine, baseDir };
}

function parseNcx(zip, ncxEntryName) {
  const xml = readEntry(zip, ncxEntryName);
  const labels = new Map();
  if (xml) {
    for (const m of xml.matchAll(
      /<navPoint id="([^"]+)"[^>]*>[\s\S]*?<navLabel><text>\s*([^<]*?)\s*<\/text><\/navLabel>\s*<content src="([^"]+)"/g,
    )) {
      labels.set(m[1], m[2].trim());
    }
  }
  return labels;
}

function extractImages(zip, html, baseDir, vol) {
  const map = new Map();
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const src = m[1];
    const entryName = path.posix.join(baseDir, src);
    const entry = zip.getEntry(entryName);
    if (!entry) continue;
    const base = path.posix.basename(src);
    const destName = `v${vol}-${base}`;
    fs.writeFileSync(path.join(imgDir, destName), entry.getData());
    map.set(src, `/resources/${RES_ID}/img/${destName}`);
  }
  return map;
}

function rewriteImages(md, imageMap) {
  for (const [orig, abs] of imageMap) {
    md = md.split(`](${orig})`).join(`](${abs})`);
  }
  return md;
}

function htmlToMd(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  return turndown.turndown(body).replace(/\n{3,}/g, "\n\n").trim();
}

const epubFiles = fs
  .readdirSync(SRC)
  .filter((f) => /\.epub$/i.test(f))
  .sort((a, b) => {
    const na = Number(/0*(\d+)/.exec(a)?.[1] ?? 0);
    const nb = Number(/0*(\d+)/.exec(b)?.[1] ?? 0);
    return na - nb;
  });

const chapters = [];
let coverSaved = false;

for (let vi = 0; vi < epubFiles.length; vi++) {
  const vol = String(vi + 1).padStart(2, "0");
  const file = path.join(SRC, epubFiles[vi]);
  const zip = new AdmZip(file);
  const opfName = zip
    .getEntries()
    .find((e) => /\.opf$/i.test(e.entryName))?.entryName;
  if (!opfName) {
    console.error(`no opf in ${file}`);
    continue;
  }

  const { manifest, spine, baseDir } = parseOpf(zip, opfName);
  const ncx = zip
    .getEntries()
    .find((e) => /\.ncx$/i.test(e.entryName))?.entryName;
  const labels = ncx ? parseNcx(zip, ncx) : new Map();

  const parts = [];
  const include = new Set();

  for (const id of spine) {
    const label = labels.get(id) ?? "";
    if (
      label === "封面" ||
      label === "声明" ||
      label === "封底" ||
      id === "coverpage"
    ) {
      continue;
    }
    include.add(id);
  }

  if (include.size === 0) {
    // 兜底：没有 NCX 标签时跳过明显的非正文页
    for (const id of spine) {
      if (id !== "coverpage") include.add(id);
    }
  }

  for (const id of spine) {
    if (!include.has(id)) continue;
    const item = manifest.get(id);
    if (!item || !item.media?.includes("xhtml")) continue;
    const entryName = path.posix.join(baseDir, item.href);
    const html = readEntry(zip, entryName);
    if (!html) continue;
    const label = labels.get(id) ?? "";
    const imageMap = extractImages(zip, html, path.posix.dirname(entryName), vol);
    let md = htmlToMd(html);
    md = rewriteImages(md, imageMap);
    if (!md) continue;
    if (label === "彩插" || label === "封面页" || label === "插图") {
      parts.push(`## 插图\n\n${md}`);
    } else if (label === "后记") {
      parts.push(`## 后记\n\n${md}`);
    } else {
      parts.push(md);
    }
  }

  if (!coverSaved) {
    const coverEntry = zip.getEntry("OPS/images/cover.jpg");
    if (coverEntry) {
      fs.writeFileSync(
        path.join(process.cwd(), "public", "resources", `${RES_ID}-cover.jpg`),
        coverEntry.getData(),
      );
      coverSaved = true;
    }
  }

  const title = `虚空之盒与零之麻理亚 · 第${CN_NUM[vi + 1]}卷`;
  const md = parts.join("\n\n").trim();
  if (!md) {
    console.error(`empty content: ${file}`);
    continue;
  }
  const fileName = `${vol}.md`;
  fs.writeFileSync(path.join(chaptersDir, fileName), `${md}\n`, "utf8");
  chapters.push({ number: vol, file: fileName, title });
  console.log(`${vol} ${title} -> ${md.length} chars`);
}

const meta = {
  id: RES_ID,
  number: "002",
  title: "虚空之盒与零之麻理亚",
  subtitle: "御影瑛路 · 全 7 卷",
  cover: `/resources/${RES_ID}-cover.jpg`,
  source: "个人收藏 · 本地 EPUB 导入",
  description:
    "《虚空之盒与零之麻理亚》是御影瑛路的经典轻小说：神秘转学生音无彩矢向星野一辉宣战，围绕可以实现任何愿望的「盒子」，一场跨越无数次重复的较量就此展开。",
  chapters,
};

fs.writeFileSync(
  path.join(dataDir, "meta.json"),
  JSON.stringify(meta, null, 2),
  "utf8",
);
console.log(`meta saved with ${chapters.length} chapters`);
