import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getAllPosts, getAllTags } from "@/lib/posts";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getAllPosts().filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">
        #{tag}
        <span className="ml-2 text-base font-normal text-ink-400">
          {posts.length} 篇
        </span>
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Link
        href="/tags"
        className="mt-6 inline-block text-sm text-accent-600 hover:underline"
      >
        ← 全部标签
      </Link>
    </div>
  );
}
