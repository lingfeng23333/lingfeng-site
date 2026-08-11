import type { Metadata } from "next";
import TrendChart from "@/components/TrendChart";
import { getIndex } from "@/lib/data";
import {
  computeStats,
  formatDuration,
  type PeriodSummary,
  type Extreme,
} from "@/lib/stats";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "统计与成就",
  description: "追番数据统计、趋势图与成就墙。",
};

function SummaryCard({
  title,
  period,
}: {
  title: string;
  period: PeriodSummary;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-sm font-medium text-ink-500">{title}</p>
      <div className="mt-3 space-y-1.5 text-sm">
        <p className="text-ink-900">
          <span className="text-xl font-bold">{period.subjects}</span>{" "}
          部番
        </p>
        <p className="text-ink-700">{period.episodes} 集</p>
        <p className="text-ink-500">{formatDuration(period.durationSeconds)}</p>
      </div>
    </div>
  );
}

function ExtremeCard({
  extreme,
  placeholder,
}: {
  extreme: Extreme | null;
  placeholder: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-medium text-ink-400">
        {extreme ? extreme.title : "记录"}
      </p>
      {extreme ? (
        <>
          <p className="mt-2 font-display text-lg font-semibold text-ink-900">
            {extreme.value}
          </p>
          <p className="mt-1 text-sm text-ink-700">{extreme.subject}</p>
          <p className="mt-0.5 text-xs text-ink-400">{extreme.detail}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-400">{placeholder}</p>
      )}
    </div>
  );
}

export default function StatsPage() {
  const stats = computeStats();
  const { lastSyncAt } = getIndex();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          统计与成就
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          数据来自 Bangumi API，最后同步于 {formatDateTime(lastSyncAt)}。
          {stats.unknownTimestamps > 0
            ? ` 另有 ${stats.unknownTimestamps} 条历史记录缺失观看时间，未计入时间类统计。`
            : ""}
        </p>
      </header>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">
          周期汇总
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard title="本周" period={stats.current.week} />
          <SummaryCard title="本月" period={stats.current.month} />
          <SummaryCard title="今年" period={stats.current.year} />
          <SummaryCard title="累计" period={stats.totals} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">
          观看趋势
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <p className="text-sm font-medium text-ink-700">最近 12 周 · 集数</p>
            <div className="mt-4">
              <TrendChart data={stats.weekly} />
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-sm font-medium text-ink-700">
              最近 12 个月 · 集数
            </p>
            <div className="mt-4">
              <TrendChart data={stats.monthly} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">
          有趣的记录
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ExtremeCard
            extreme={stats.fastest}
            placeholder="暂无足够时间数据"
          />
          <ExtremeCard
            extreme={stats.longestGap}
            placeholder="暂无足够时间数据"
          />
          <ExtremeCard extreme={stats.maxDay} placeholder="暂无观看记录" />
          <ExtremeCard
            extreme={stats.dropped}
            placeholder="暂无弃坑记录，继续保持！"
          />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink-900">
          成就墙
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          已解锁 {stats.achievements.filter((a) => a.unlocked).length} /{" "}
          {stats.achievements.length} 个成就
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 transition ${
                a.unlocked
                  ? "glass"
                  : "border-paper-300 bg-paper-100 opacity-70"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{a.icon}</span>
                <h3 className="font-display text-sm font-semibold text-ink-900">
                  {a.name}
                </h3>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                    a.unlocked
                      ? "bg-accent-500/10 text-accent-600"
                      : "bg-paper-200 text-ink-400"
                  }`}
                >
                  {a.unlocked ? "已解锁" : "未解锁"}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-500">{a.description}</p>
              <p className="mt-1 text-xs font-medium text-ink-700">
                {a.value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
