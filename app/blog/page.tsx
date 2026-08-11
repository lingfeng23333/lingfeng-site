import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description: "分集感想与随笔，按时间排列。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900">博客</h1>
        <Link
          href="/write"
          className="rounded-full border border-paper-300 px-4 py-1.5 text-sm text-ink-700 transition hover:border-accent-500/50 hover:text-accent-700"
        >
          写作台 →
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink-500">
        分集感想与日常随笔，共 {posts.length} 篇。
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
