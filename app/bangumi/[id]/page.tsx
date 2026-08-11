import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import CoverImage from "@/components/CoverImage";
import EpisodeWatchButton from "@/components/EpisodeWatchButton";
import { getIndex, getSubject } from "@/lib/data";
import { getPostsBySubject } from "@/lib/posts";
import { collectionLabels, formatDate, watchLabels } from "@/lib/format";
import type { CollectionType } from "@/lib/types";

export function generateStaticParams() {
  return getIndex().subjects.map((s) => ({ id: String(s.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const subject = getSubject(Number(id));
  return { title: subject?.nameCn || subject?.name || "番剧" };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = getSubject(Number(id));
  if (!subject) notFound();

  const posts = getPostsBySubject(subject.id);
  const postsByEp = new Map(posts.map((p) => [p.ep, p]));
  const progressPct =
    subject.totalEpisodes && subject.totalEpisodes > 0
      ? Math.round((subject.epStatus / subject.totalEpisodes) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <header className="glass flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:p-8">
        <div className="relative h-56 w-40 shrink-0 overflow-hidden rounded-2xl bg-paper-200 sm:h-64 sm:w-44">
          <CoverImage
            src={subject.cover}
            alt={subject.nameCn || subject.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-600 ring-1 ring-accent-500/30">
              {collectionLabels[subject.collectionType as CollectionType]}
            </span>
            {subject.rate > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-300">
                我的评分 {subject.rate}
              </span>
            ) : null}
            {subject.rating?.score ? (
              <span className="rounded-full bg-paper-200 px-3 py-1 text-xs text-ink-700">
                Bangumi {subject.rating.score.toFixed(1)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            {subject.nameCn || subject.name}
          </h1>
          {subject.nameCn && subject.nameCn !== subject.name ? (
            <p className="mt-1 text-sm text-ink-500">{subject.name}</p>
          ) : null}
          <p className="mt-2 text-sm text-ink-400">
            {[subject.platform, subject.airDate ? `${formatDate(subject.airDate)} 开播` : "", `共 ${subject.totalEpisodes || "?"} 话`]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-5 max-w-xl">
            <div className="flex justify-between text-xs text-ink-500">
              <span>看到 EP {subject.epStatus}</span>
              <span>{subject.totalEpisodes ? `${progressPct}%` : ""}</span>
            </div>
            <ProgressBar
              current={subject.epStatus}
              total={subject.totalEpisodes || 0}
              className="mt-1.5"
            />
          </div>

          {subject.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {subject.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-paper-200 px-2.5 py-0.5 text-xs text-ink-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {subject.summary ? (
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            简介
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-700">
            {subject.summary}
          </p>
        </section>
      ) : null}

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          分集与感想
        </h2>
        {subject.episodes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            {subject.collectionType === 2
              ? `已看完，共 ${subject.epStatus} 话。`
              : "暂无分集数据，等下次同步吧。"}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-paper-300">
            {subject.episodes.map((ep) => {
              const post = postsByEp.get(ep.ep ?? -1);
              return (
                <li key={ep.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      ep.watchStatus === 2
                        ? "bg-accent-500/25 text-accent-600"
                        : "bg-paper-200 text-ink-400"
                    }`}
                  >
                    {ep.ep ?? ep.sort}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-900">
                      {ep.nameCn || ep.name}
                    </p>
                    <p className="text-xs text-ink-400">
                      {watchLabels[ep.watchStatus]}
                      {ep.airdate ? ` · ${formatDate(ep.airdate)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {ep.type === 0 ? (
                      <EpisodeWatchButton
                        subjectId={subject.id}
                        episodeId={ep.id}
                        initialStatus={ep.watchStatus}
                      />
                    ) : null}
                    {post ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="shrink-0 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs text-accent-600 transition hover:bg-accent-500/10"
                      >
                        ★ {post.summary || "感想"}
                      </Link>
                    ) : ep.watchStatus === 2 ? (
                      <span className="shrink-0 text-xs text-ink-400">
                        未写感想
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {subject.episodes.length > 0 ? (
          <p className="mt-4 text-xs text-ink-400">
            标记会实时写回 Bangumi，站点进度在下次定时同步后更新。
          </p>
        ) : null}
      </section>
    </div>
  );
}
