import Link from "next/link";
import PostCard from "@/components/PostCard";
import QuoteCard from "@/components/QuoteCard";
import Reveal from "@/components/Reveal";
import SubjectCard from "@/components/SubjectCard";
import CoverImage from "@/components/CoverImage";
import { getAllPosts } from "@/lib/posts";
import { getData, getIndex, getSubjectsByType } from "@/lib/data";
import { getRandomQuote } from "@/lib/quotes";
import { getResources } from "@/lib/resources";
import { computeStats, formatDuration } from "@/lib/stats";
import { formatDateTime } from "@/lib/format";

export default function Home() {
  const posts = getAllPosts().slice(0, 4);
  const doing = getSubjectsByType(3).slice(0, 10);
  const resources = getResources().slice(0, 3);
  const { lastSyncAt } = getIndex();
  const { user } = getData();
  const stats = computeStats();
  const week = stats.current.week;

  return (
    <div className="space-y-12">
      <Reveal>
        <section className="glass grid gap-8 overflow-hidden rounded-3xl p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-600">
              Lingfeng&apos;s Site
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-5xl">
              风起<span className="text-gradient">之地</span>
            </h1>
            <p className="mt-2 font-display text-lg text-accent-600 sm:text-xl">
              一切的起始点
            </p>
            <p className="mt-4 max-w-xl leading-7 text-ink-700">
              凌风的个人站 · 追番、分集感想、随笔与收藏。
              <br />
              追番数据由 Bangumi 自动同步，随时更新。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/bangumi"
                className="rounded-full bg-gradient-to-r from-accent-500 to-flare-500 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                去追番
              </Link>
              <Link
                href="/blog"
                className="rounded-full border border-paper-300 px-6 py-2.5 text-sm text-ink-700 transition hover:border-accent-500/60 hover:text-accent-600"
              >
                读博客
              </Link>
              <Link
                href="/resources"
                className="rounded-full border border-paper-300 px-6 py-2.5 text-sm text-ink-700 transition hover:border-accent-500/60 hover:text-accent-600"
              >
                逛资源
              </Link>
            </div>
          </div>

          <div className="paper-panel rounded-2xl p-6">
            <p className="text-xs font-medium text-ink-500">本周速览</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-700">看了几部番</span>
                <span className="text-2xl font-bold text-ink-900">
                  {week.subjects}
                  <span className="ml-1 text-xs font-normal text-ink-400">
                    部
                  </span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-700">看了几集</span>
                <span className="text-2xl font-bold text-accent-600">
                  {week.episodes}
                  <span className="ml-1 text-xs font-normal text-ink-400">
                    集
                  </span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-700">看了多久</span>
                <span className="text-2xl font-bold text-flare-500">
                  {formatDuration(week.durationSeconds)}
                </span>
              </div>
            </div>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-paper-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-500 to-flare-500"
                style={{
                  width: `${stats.totals.episodes > 0 ? Math.min(100, Math.round((week.episodes / Math.max(stats.totals.episodes, 1)) * 100 * 3)) : 0}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-400">
              本周占累计观看的比例（示意）
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "在看",
              value: getSubjectsByType(3).length,
              unit: "部",
            },
            {
              label: "累计集数",
              value: stats.totals.episodes,
              unit: "集",
            },
            {
              label: "累计时长",
              value: formatDuration(stats.totals.durationSeconds),
              unit: "",
            },
            { label: "最后同步", value: formatDateTime(lastSyncAt), unit: "" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-4">
              <p className="text-xs text-ink-500">{item.label}</p>
              <p className="mt-1 truncate text-lg font-bold text-ink-900">
                {item.value}
                {item.unit ? (
                  <span className="ml-1 text-xs font-normal text-ink-400">
                    {item.unit}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </section>
      </Reveal>

      <Reveal>
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
      </Reveal>

      <Reveal>
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
          <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2">
            {doing.map((subject) => (
              <div key={subject.id} className="w-40 shrink-0 snap-start">
                <SubjectCard subject={subject} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-400">
            数据来自 {user.nickname} 的 Bangumi 收藏
          </p>
        </section>
      </Reveal>

      {resources.length > 0 ? (
        <Reveal>
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink-900">
                正在读的资源
              </h2>
              <Link
                href="/resources"
                className="text-sm text-accent-600 transition hover:underline"
              >
                全部 →
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="glass group overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-accent-500/40"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-paper-200">
                    <CoverImage
                      src={resource.cover}
                      alt={resource.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-accent-600 shadow">
                      #{resource.number}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-display text-base font-semibold text-ink-900">
                      {resource.title}
                    </h3>
                    {resource.subtitle ? (
                      <p className="mt-1 text-xs text-ink-500">
                        {resource.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs font-medium text-accent-600">
                      {resource.chapters.length} 章 · 开始阅读 →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <QuoteCard initial={getRandomQuote()} />
      </Reveal>
    </div>
  );
}
