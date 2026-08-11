import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览文章。",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">标签</h1>
      <p className="mt-2 text-sm text-ink-500">
        共 {tags.length} 个标签。
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="glass rounded-full px-4 py-1.5 text-sm text-ink-700 transition hover:border-accent-500/60 hover:text-accent-700"
          >
            {tag} <span className="text-xs text-ink-400">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
