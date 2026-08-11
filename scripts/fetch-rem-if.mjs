import fs from "node:fs";
import path from "node:path";

const PUBLISHED_BASE =
  "https://teedoc.github.io/re0-web-teedoc/gitbook/book/markdown/ch/chapter099/if/06/";
const HOST = "https://teedoc.github.io/re0-web-teedoc";
const RAW_BASE =
  "https://raw.githubusercontent.com/teedoc/re0-web-teedoc/master/books/re0/ch/chapter099/if/06/";

async function getText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "LingFengSite/0.1 (resource crawler)" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function rewriteImages(md) {
  return md.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      const s = src.trim();
      if (/^https?:\/\//.test(s)) return match;
      const absolute = s.startsWith("/") ? `${HOST}${s}` : new URL(s, PUBLISHED_BASE).href;
      return `![${alt}](${absolute})`;
    },
  );
}

const readme = await getText(`${RAW_BASE}README.md`);
const chapterLinks = [
  ...readme.matchAll(/- \[([^\]]+)\]\((\d+)\.html\)/g),
].map((m) => ({ title: m[1], file: `${m[2]}.md` }));

if (chapterLinks.length === 0) {
  console.error("no chapters parsed from README");
  process.exit(1);
}

const dir = path.join(process.cwd(), "data", "resources", "rem-if");
const chaptersDir = path.join(dir, "chapters");
fs.mkdirSync(chaptersDir, { recursive: true });

for (const ch of chapterLinks) {
  const md = rewriteImages(await getText(`${RAW_BASE}${ch.file}`));
  fs.writeFileSync(path.join(chaptersDir, ch.file), md, "utf8");
  console.log(`fetched ${ch.file} ${ch.title} (${md.length} chars)`);
}

const meta = {
  id: "rem-if",
  number: "001",
  title: "从 IF 开始的异世界生活（雷姆 IF 线）",
  subtitle: "怠惰 IF 线 · 长月达平",
  cover: "/resources/rem-if-cover.jpg",
  source: PUBLISHED_BASE,
  description:
    "《Re:Zero》官方 IF 线之一「怠惰线」：如果菜月昴在第三章选择与蕾姆私奔逃往卡拉拉基，两个人从零开始经营小家的故事。",
  chapters: chapterLinks.map((ch) => ({
    file: ch.file,
    title: ch.title,
  })),
};

fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
console.log(`meta saved with ${meta.chapters.length} chapters`);
