import Link from "next/link";
import PostCard from "@/components/PostCard";
import QuoteCard from "@/components/QuoteCard";
import SubjectCard from "@/components/SubjectCard";
import { getAllPosts } from "@/lib/posts";
import { getData, getIndex, getSubjectsByType } from "@/lib/data";
import { getRandomQuote } from "@/lib/quotes";
import { formatDateTime } from "@/lib/format";

export default function Home() {
  const posts = getAllPosts().slice(0, 4);
  const doing = getSubjectsByType(3).slice(0, 8);
  const { lastSyncAt } = getIndex();
  const { user } = getData();

  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-accent-600">
          Lingfeng&apos;s Site
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          凌风<span className="text-gradient">的个人站</span>
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-ink-700">
          追番 · 分集感想 · 日常随笔。
          <br />
          追番数据由 Bangumi 自动同步，最后同步于{" "}
          {formatDateTime(lastSyncAt)}。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/bangumi"
            className="rounded-full bg-gradient-to-r from-accent-500 to-flare-500 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            去追番
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-paper-300 px-5 py-2 text-sm text-ink-700 transition hover:border-accent-500/60 hover:text-accent-700"
          >
            读博客
          </Link>
        </div>
      </section>

      <QuoteCard initial={getRandomQuote()} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            最新文章
          </h2>
          <Link
            href="/blog"
            className="text-sm text-accent-600 transition hover:underline"
          >
            全部 →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))
          ) : (
            <p className="text-sm text-ink-400">
              还没有文章，去 content/posts 写一篇吧。
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            最近在看
          </h2>
          <Link
            href="/bangumi"
            className="text-sm text-accent-600 transition hover:underline"
          >
            全部 →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {doing.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400">
          数据来自 {user.nickname} 的 Bangumi 收藏
        </p>
      </section>
    </div>
  );
}
