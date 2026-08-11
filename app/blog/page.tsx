import type { Metadata } from "next";
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
      <h1 className="font-display text-2xl font-bold text-ink-900">博客</h1>
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
