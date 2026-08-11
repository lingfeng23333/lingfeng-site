import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CoverImage from "@/components/CoverImage";
import Spoiler from "@/components/Spoiler";
import { getAllPosts, getAdjacentPosts, getPostBySlug } from "@/lib/posts";
import { getSubject } from "@/lib/data";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const subject = post.subjectId ? getSubject(post.subjectId) : null;
  const { prev, next } = getAdjacentPosts(slug);

  const markdown = (
    <div className="prose max-w-none prose-headings:text-ink-900 prose-a:text-accent-600 prose-strong:text-ink-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {post.content}
      </ReactMarkdown>
    </div>
  );

  return (
    <article className="paper-panel mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
      <header>
        {subject ? (
          <Link
            href={`/bangumi/${subject.id}`}
            className="glass mb-6 flex items-center gap-3 rounded-2xl p-3 transition hover:border-accent-500/40"
          >
            <CoverImage
              src={subject.cover}
              alt=""
              className="h-14 w-10 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">
                {subject.nameCn || subject.name}
              </p>
              <p className="text-xs text-ink-400">
                {subject.airDate
                  ? `${formatDate(subject.airDate)} 开播`
                  : "Bangumi 条目"}
              </p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-600 ring-1 ring-accent-500/30">
              EP {post.ep}
            </span>
          </Link>
        ) : null}

        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
          <time>{formatDate(post.date)}</time>
          <span>
            {post.wordCount} 字 · 约 {post.readingMinutes} 分钟
          </span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="rounded-full bg-paper-200 px-2 py-0.5 text-xs text-ink-500 transition hover:text-accent-700"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      <div className="mt-8">
        {post.spoiler ? <Spoiler>{markdown}</Spoiler> : markdown}
      </div>

      <nav className="mt-12 flex flex-wrap items-stretch justify-between gap-4 border-t border-paper-300 pt-6">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="max-w-[45%] text-sm text-ink-500 transition hover:text-accent-700"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="max-w-[45%] text-right text-sm text-ink-500 transition hover:text-accent-700"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
