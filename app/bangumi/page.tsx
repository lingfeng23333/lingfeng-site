import type { Metadata } from "next";
import SubjectCard from "@/components/SubjectCard";
import { getData, getIndex, getSubjectsByType } from "@/lib/data";
import { collectionLabels, formatDateTime } from "@/lib/format";
import type { CollectionType } from "@/lib/types";

export const metadata: Metadata = {
  title: "追番",
  description: "凌风的 Bangumi 动画收藏。",
};

export default function BangumiPage() {
  const { lastSyncAt, subjects } = getIndex();
  const { user } = getData();
  const groups = ([3, 2, 1, 4, 5] as CollectionType[])
    .map((type) => ({ type, items: getSubjectsByType(type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">追番</h1>
          <p className="mt-2 text-sm text-ink-500">
            {user.nickname} 的 Bangumi 动画收藏 · 共 {subjects.length} 部 ·
            同步于 {formatDateTime(lastSyncAt)}
          </p>
        </div>
        <a
          href={user.url || "https://bgm.tv"}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-paper-300 px-4 py-2 text-sm text-ink-700 transition hover:border-accent-500/60 hover:text-accent-700"
        >
          Bangumi 主页 ↗
        </a>
      </header>

      {groups.map((group) => (
        <section key={group.type}>
          <h2 className="font-display text-xl font-semibold text-ink-900">
            {collectionLabels[group.type]}{" "}
            <span className="text-sm font-normal text-ink-400">
              （{group.items.length}）
            </span>
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {group.items.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
