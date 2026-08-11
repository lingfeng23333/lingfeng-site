import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass group block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-accent-500/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        {post.subjectId && post.ep !== undefined ? (
          <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 text-xs font-semibold text-accent-600 ring-1 ring-accent-500/30">
            EP {post.ep}
          </span>
        ) : null}
        <time className="text-xs text-ink-400">{formatDate(post.date)}</time>
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 transition group-hover:text-accent-700">
        {post.title}
      </h3>
      {post.anime ? (
        <p className="mt-1 text-sm text-ink-500">{post.anime}</p>
      ) : null}
      {post.summary ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-500">
          {post.summary}
        </p>
      ) : null}
      {post.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-paper-200 px-2 py-0.5 text-xs text-ink-500"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
