"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [anime, setAnime] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [ep, setEp] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const buildMarkdown = () => {
    const lines = [
      "---",
      `title: ${title.trim() || "未命名"}`,
      `date: ${date}`,
    ];
    if (summary.trim()) lines.push(`summary: ${summary.trim()}`);
    const tagList = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length > 0) lines.push(`tags: [${tagList.join(", ")}]`);
    if (subjectId.trim()) lines.push(`subject_id: ${Number(subjectId)}`);
    if (ep.trim()) lines.push(`ep: ${Number(ep)}`);
    if (anime.trim()) lines.push(`anime: ${anime.trim()}`);
    if (spoiler) lines.push("spoiler: true");
    lines.push("---", "", body.trim());
    return lines.join("\n");
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(buildMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([buildMarkdown()], {
      type: "text/markdown;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const safe =
      title
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "-") || "post";
    a.download = `${date}-${safe}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          写作台
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          在这里写好文章，点击生成 Markdown，把文件放进{" "}
          <code className="rounded bg-paper-200 px-1.5 py-0.5 text-xs">
            content/posts/
          </code>{" "}
          再 git push 就上线了。填了「番剧 ID + 集数」就是分集感想。
        </p>
      </header>

      <div className="glass space-y-4 rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              标题
            </span>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="EP05 · 雨中告白"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              日期
            </span>
            <input
              className={inputCls}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-500">
            一句话短评（显示在番剧分集列表，可留空）
          </span>
          <input
            className={inputCls}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="这集的演出太顶了"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              标签（逗号分隔）
            </span>
            <input
              className={inputCls}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="感想, 恋爱"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              番剧名（可选）
            </span>
            <input
              className={inputCls}
              value={anime}
              onChange={(e) => setAnime(e.target.value)}
              placeholder="冰菓"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              番剧 ID（从追番页地址栏获取，如 27364）
            </span>
            <input
              className={inputCls}
              type="number"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="27364"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500">
              集数
            </span>
            <input
              className={inputCls}
              type="number"
              value={ep}
              onChange={(e) => setEp(e.target.value)}
              placeholder="4"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={spoiler}
            onChange={(e) => setSpoiler(e.target.checked)}
            className="h-4 w-4 rounded border-paper-300 accent-accent-500"
          />
          包含剧透（正文默认折叠）
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-500">
            正文（Markdown）
          </span>
          <textarea
            className={`${inputCls} min-h-56 resize-y leading-6`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"## 感想\n\n这一集……"}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={copyMarkdown}
          className="rounded-full bg-gradient-to-r from-accent-500 to-flare-500 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {copied ? "已复制 ✓" : "复制 Markdown"}
        </button>
        <button
          onClick={downloadMarkdown}
          className="rounded-full border border-paper-300 px-5 py-2 text-sm text-ink-700 transition hover:border-accent-500/50 hover:text-accent-700"
        >
          下载 .md 文件
        </button>
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-medium text-ink-500">生成预览</p>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-paper-100 p-4 text-xs leading-5 text-ink-700">
          {buildMarkdown()}
        </pre>
      </div>
    </div>
  );
}
