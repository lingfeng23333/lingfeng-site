import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export const metadata: Metadata = {
  title: "归档",
  description: "按月份归档的全部文章。",
};

export default function ArchivesPage() {
  const posts = getAllPosts();
  const groups = posts.reduce<Record<string, Post[]>>((acc, post) => {
    const key = post.date.slice(0, 7) || "未标注日期";
    (acc[key] = acc[key] || []).push(post);
    return acc;
  }, {});

  const months = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">归档</h1>
      <p className="mt-2 text-sm text-ink-500">共 {posts.length} 篇文章。</p>
      <div className="mt-8 space-y-8">
        {months.map((month) => (
          <section key={month}>
            <h2 className="font-display text-lg font-semibold text-accent-600">
              {month}
            </h2>
            <ul className="mt-3 divide-y divide-paper-300">
              {groups[month].map((post) => (
                <li key={post.slug} className="flex items-baseline gap-4 py-2.5">
                  <time className="shrink-0 text-xs text-ink-400">
                    {formatDate(post.date)}
                  </time>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="truncate text-sm text-ink-700 transition hover:text-accent-700"
                  >
                    {post.subjectId && post.ep !== undefined
                      ? `[EP ${post.ep}] `
                      : ""}
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
