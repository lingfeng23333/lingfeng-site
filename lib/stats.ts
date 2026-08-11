import { getIndex, getSubject } from "./data";
import type { Subject } from "./types";

// Bangumi 的时间戳是秒级 unix；统一按北京时间（UTC+8）归档
const SHIFT_MS = 8 * 3600 * 1000;
const DAY_MS = 86400000;
const HOUR_MS = 3600000;

const pad = (n: number) => String(n).padStart(2, "0");

function shanghai(tsSec: number): Date {
  return new Date(tsSec * 1000 + SHIFT_MS);
}

function dateKey(tsSec: number): string {
  const d = shanghai(tsSec);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function monthKey(tsSec: number): string {
  const d = shanghai(tsSec);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

function yearKey(tsSec: number): string {
  return String(shanghai(tsSec).getUTCFullYear());
}

function weekStartMs(tsSec: number): number {
  const d = shanghai(tsSec);
  const mondayOffset = (d.getUTCDay() + 6) % 7;
  return (
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate() - mondayOffset,
    ) - SHIFT_MS
  );
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h <= 0) return `${m} 分钟`;
  if (m === 0) return `${h} 小时`;
  return `${h} 小时 ${m} 分`;
}

export function formatGap(sec: number): string {
  if (sec < 60) return `${sec} 秒`;
  if (sec < HOUR_MS / 1000) return `${Math.round(sec / 60)} 分钟`;
  if (sec < DAY_MS / 1000) return `${Math.floor(sec / 3600)} 小时`;
  return `${Math.floor(sec / (DAY_MS / 1000))} 天`;
}

export interface PeriodSummary {
  subjects: number;
  episodes: number;
  durationSeconds: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface Extreme {
  title: string;
  subject: string;
  detail: string;
  value: string;
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
  value: string;
}

export interface SiteStats {
  totals: PeriodSummary;
  current: {
    week: PeriodSummary;
    month: PeriodSummary;
    year: PeriodSummary;
  };
  weekly: TrendPoint[];
  monthly: TrendPoint[];
  fastest: Extreme | null;
  longestGap: Extreme | null;
  maxDay: Extreme | null;
  dropped: Extreme | null;
  achievements: Achievement[];
  unknownTimestamps: number;
}

interface WatchedEntry {
  subjectId: number;
  ts: number;
  duration: number;
}

export function computeStats(): SiteStats {
  const subjects = getIndex()
    .subjects.map((s) => getSubject(s.id))
    .filter((s): s is Subject => s !== null);

  const entries: WatchedEntry[] = [];
  for (const s of subjects) {
    for (const e of s.episodes) {
      if (e.watchStatus !== 2) continue;
      entries.push({
        subjectId: s.id,
        ts: e.watchedAt && e.watchedAt > 0 ? e.watchedAt : 0,
        duration: e.durationSeconds ?? 0,
      });
    }
  }

  const timed = entries.filter((e) => e.ts > 0);
  const unknownTimestamps = entries.length - timed.length;

  const summarize = (list: WatchedEntry[]): PeriodSummary => ({
    subjects: new Set(list.map((e) => e.subjectId)).size,
    episodes: list.length,
    durationSeconds: list.reduce((a, e) => a + e.duration, 0),
  });

  const totals = summarize(entries);
  const nowSec = Math.floor(Date.now() / 1000);
  const wkStart = weekStartMs(nowSec);
  const currentWeek = summarize(
    timed.filter((e) => {
      const ms = e.ts * 1000;
      return ms >= wkStart && ms < wkStart + 7 * DAY_MS;
    }),
  );
  const currentMonthKey = monthKey(nowSec);
  const currentMonth = summarize(
    timed.filter((e) => monthKey(e.ts) === currentMonthKey),
  );
  const currentYearKey = yearKey(nowSec);
  const currentYear = summarize(
    timed.filter((e) => yearKey(e.ts) === currentYearKey),
  );

  // 最近 12 周 / 12 个月趋势
  const weekly: TrendPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = wkStart - i * 7 * DAY_MS;
    const end = start + 7 * DAY_MS;
    const value = timed.filter((e) => {
      const ms = e.ts * 1000;
      return ms >= start && ms < end;
    }).length;
    const d = new Date(start + SHIFT_MS);
    weekly.push({
      label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
      value,
    });
  }

  const monthly: TrendPoint[] = [];
  const nowD = shanghai(nowSec);
  for (let i = 11; i >= 0; i--) {
    const startD = new Date(
      Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth() - i, 1),
    );
    const endD = new Date(
      Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth() - i + 1, 1),
    );
    const start = startD.getTime() - SHIFT_MS;
    const end = endD.getTime() - SHIFT_MS;
    const value = timed.filter((e) => {
      const ms = e.ts * 1000;
      return ms >= start && ms < end;
    }).length;
    monthly.push({
      label: `${String(startD.getUTCFullYear()).slice(2)}.${pad(startD.getUTCMonth() + 1)}`,
      value,
    });
  }

  // 集间隔极值
  let minGap = Infinity;
  let maxGap = 0;
  let fastest: Extreme | null = null;
  let longestGap: Extreme | null = null;
  for (const s of subjects) {
    const list = s.episodes
      .filter((e) => e.watchStatus === 2 && e.watchedAt && e.watchedAt > 0)
      .map((e) => ({ ep: e.ep, ts: e.watchedAt as number }))
      .sort((a, b) => a.ts - b.ts);
    const name = s.nameCn || s.name;
    for (let i = 1; i < list.length; i++) {
      const gap = list[i].ts - list[i - 1].ts;
      if (gap <= 0) continue;
      const detail = `EP${list[i - 1].ep ?? "?"} → EP${list[i].ep ?? "?"}`;
      if (gap < minGap) {
        minGap = gap;
        fastest = {
          title: "最神速的一集",
          subject: name,
          detail,
          value: formatGap(gap),
        };
      }
      if (gap > maxGap) {
        maxGap = gap;
        longestGap = {
          title: "距离之最",
          subject: name,
          detail,
          value: formatGap(gap),
        };
      }
    }
  }

  // 单日 / 单周 / 单月最多
  const byDay = new Map<string, number>();
  const byWeek = new Map<number, number>();
  const byMonth = new Map<string, number>();
  for (const e of timed) {
    const dk = dateKey(e.ts);
    byDay.set(dk, (byDay.get(dk) ?? 0) + 1);
    const wk = weekStartMs(e.ts);
    byWeek.set(wk, (byWeek.get(wk) ?? 0) + 1);
    const mk = monthKey(e.ts);
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + 1);
  }
  let maxDayCount = 0;
  let maxDayKey = "";
  for (const [k, v] of byDay) {
    if (v > maxDayCount) {
      maxDayCount = v;
      maxDayKey = k;
    }
  }
  const maxDay: Extreme | null = maxDayKey
    ? {
        title: "单日最多",
        subject: "一天之内",
        detail: maxDayKey,
        value: `${maxDayCount} 集`,
      }
    : null;
  const weekMax = Math.max(0, ...byWeek.values());
  const monthMax = Math.max(0, ...byMonth.values());

  // 连续观看天数
  const daySet = [...new Set(timed.map((e) => dateKey(e.ts)))].sort();
  let streakMax = 0;
  let streak = 0;
  let prevDay = 0;
  for (const k of daySet) {
    const cur = Date.parse(`${k}T00:00:00Z`) / DAY_MS;
    streak = cur === prevDay + 1 ? streak + 1 : 1;
    if (streak > streakMax) streakMax = streak;
    prevDay = cur;
  }

  const nightCount = timed.filter(
    (e) => shanghai(e.ts).getUTCHours() < 5,
  ).length;
  const firstTs = timed.length
    ? Math.min(...timed.map((e) => e.ts))
    : null;

  const finished = subjects.filter((s) => s.collectionType === 2).length;
  const doing = subjects.filter((s) => s.collectionType === 3).length;
  const wish = subjects.filter((s) => s.collectionType === 1).length;
  const rated = subjects.filter((s) => s.rate > 0).length;
  const droppedSubjects = subjects.filter((s) => s.collectionType === 5);
  const watchedSubjects = subjects.filter((s) =>
    s.episodes.some((e) => e.watchStatus === 2),
  );
  const nowYearNum = shanghai(nowSec).getUTCFullYear();
  const oldCount = watchedSubjects.filter(
    (s) => s.airDate && Number(s.airDate.slice(0, 4)) <= nowYearNum - 10,
  ).length;
  const newCount = watchedSubjects.filter(
    (s) => s.airDate && Number(s.airDate.slice(0, 4)) >= nowYearNum - 1,
  ).length;
  const nicheCount = watchedSubjects.filter(
    (s) => s.rating?.score && s.rating.score <= 6.5,
  ).length;
  const godCount = watchedSubjects.filter(
    (s) => s.rating?.score && s.rating.score >= 8.5,
  ).length;
  const platformSet = new Set(
    watchedSubjects.map((s) => s.platform).filter(Boolean),
  );

  const dropped: Extreme | null = droppedSubjects.length
    ? (() => {
        const worst = [...droppedSubjects].sort(
          (a, b) => b.epStatus - a.epStatus,
        )[0];
        return {
          title: "弃坑之最",
          subject: worst.nameCn || worst.name,
          detail: `抛弃时看到 EP${worst.epStatus}`,
          value: `${droppedSubjects.length} 部弃坑`,
        };
      })()
    : null;

  const progress = (cur: number, target: number, unit: string) =>
    cur >= target
      ? `${cur} ${unit}`
      : `${cur} / ${target} ${unit}`;

  const achievements: Achievement[] = [
    {
      id: "first_watch",
      icon: "🌱",
      name: "初次见面",
      description: "留下第一条观看记录",
      unlocked: firstTs !== null,
      value: firstTs ? dateKey(firstTs) : "还没有记录",
    },
    {
      id: "ep_100",
      icon: "📺",
      name: "百集斩",
      description: "累计看过 100 集",
      unlocked: totals.episodes >= 100,
      value: progress(totals.episodes, 100, "集"),
    },
    {
      id: "ep_300",
      icon: "🔥",
      name: "三百集达成",
      description: "累计看过 300 集",
      unlocked: totals.episodes >= 300,
      value: progress(totals.episodes, 300, "集"),
    },
    {
      id: "ep_500",
      icon: "⚔️",
      name: "五百集斩",
      description: "累计看过 500 集",
      unlocked: totals.episodes >= 500,
      value: progress(totals.episodes, 500, "集"),
    },
    {
      id: "ep_1000",
      icon: "👑",
      name: "千集斩",
      description: "累计看过 1000 集",
      unlocked: totals.episodes >= 1000,
      value: progress(totals.episodes, 1000, "集"),
    },
    {
      id: "dur_24h",
      icon: "⏱️",
      name: "追番一整天",
      description: "累计观看时长达到 24 小时",
      unlocked: totals.durationSeconds >= 24 * 3600,
      value: formatDuration(totals.durationSeconds),
    },
    {
      id: "dur_100h",
      icon: "🌙",
      name: "四个日夜",
      description: "累计观看时长达到 100 小时",
      unlocked: totals.durationSeconds >= 100 * 3600,
      value: formatDuration(totals.durationSeconds),
    },
    {
      id: "finish_1",
      icon: "✅",
      name: "第一部完结",
      description: "看完第一部番",
      unlocked: finished >= 1,
      value: `${finished} 部`,
    },
    {
      id: "finish_5",
      icon: "🎓",
      name: "完结达人",
      description: "看完 5 部番",
      unlocked: finished >= 5,
      value: progress(finished, 5, "部"),
    },
    {
      id: "finish_10",
      icon: "🏆",
      name: "完结狂魔",
      description: "看完 10 部番",
      unlocked: finished >= 10,
      value: progress(finished, 10, "部"),
    },
    {
      id: "doing_10",
      icon: "🐟",
      name: "追番狂魔",
      description: "同时在追 10 部番",
      unlocked: doing >= 10,
      value: progress(doing, 10, "部"),
    },
    {
      id: "wish_10",
      icon: "📋",
      name: "补番清单",
      description: "想看列表里有 10 部番",
      unlocked: wish >= 10,
      value: progress(wish, 10, "部"),
    },
    {
      id: "rate_10",
      icon: "⭐",
      name: "评分大师",
      description: "给 10 部番打过分",
      unlocked: rated >= 10,
      value: progress(rated, 10, "部"),
    },
    {
      id: "old_10",
      icon: "🕰️",
      name: "十年老番",
      description: "看过至少 10 年前开播的番",
      unlocked: oldCount > 0,
      value: `${oldCount} 部`,
    },
    {
      id: "new_1",
      icon: "✨",
      name: "追新番",
      description: "看过 1 年内开播的番",
      unlocked: newCount > 0,
      value: `${newCount} 部`,
    },
    {
      id: "niche",
      icon: "🔍",
      name: "冷门猎手",
      description: "看过一部 Bangumi 评分 ≤6.5 的番",
      unlocked: nicheCount > 0,
      value: `${nicheCount} 部`,
    },
    {
      id: "god",
      icon: "💎",
      name: "神作猎人",
      description: "看过一部 Bangumi 评分 ≥8.5 的番",
      unlocked: godCount > 0,
      value: `${godCount} 部`,
    },
    {
      id: "dropped_1",
      icon: "💢",
      name: "弃坑王",
      description: "至少抛弃过 1 部番",
      unlocked: droppedSubjects.length > 0,
      value: `${droppedSubjects.length} 部`,
    },
    {
      id: "streak_7",
      icon: "📅",
      name: "七日连看",
      description: "连续 7 天每天至少看 1 集",
      unlocked: streakMax >= 7,
      value: progress(streakMax, 7, "天"),
    },
    {
      id: "streak_14",
      icon: "🗓️",
      name: "半月连看",
      description: "连续 14 天每天至少看 1 集",
      unlocked: streakMax >= 14,
      value: progress(streakMax, 14, "天"),
    },
    {
      id: "night_10",
      icon: "🦉",
      name: "夜猫子",
      description: "凌晨 0–5 点看过 10 集",
      unlocked: nightCount >= 10,
      value: progress(nightCount, 10, "集"),
    },
    {
      id: "day_12",
      icon: "🚀",
      name: "一口气",
      description: "单日看过 12 集",
      unlocked: maxDayCount >= 12,
      value: progress(maxDayCount, 12, "集"),
    },
    {
      id: "week_30",
      icon: "💪",
      name: "劳模之周",
      description: "一周看过 30 集",
      unlocked: weekMax >= 30,
      value: progress(weekMax, 30, "集"),
    },
    {
      id: "month_60",
      icon: "🥇",
      name: "月度冠军",
      description: "一个月看过 60 集",
      unlocked: monthMax >= 60,
      value: progress(monthMax, 60, "集"),
    },
    {
      id: "fastest_10",
      icon: "⚡",
      name: "神速",
      description: "相邻两集间隔不超过 10 分钟",
      unlocked: minGap <= 600,
      value: Number.isFinite(minGap) ? formatGap(minGap) : "暂无数据",
    },
    {
      id: "gap_30d",
      icon: "🐢",
      name: "距离之最",
      description: "相邻两集间隔超过 30 天",
      unlocked: maxGap >= 30 * (DAY_MS / 1000),
      value: maxGap > 0 ? formatGap(maxGap) : "暂无数据",
    },
    {
      id: "platforms_5",
      icon: "🍱",
      name: "杂食动物",
      description: "看过 5 种不同平台（TV / Web / 剧场版…）",
      unlocked: platformSet.size >= 5,
      value: `${platformSet.size} / 5 种`,
    },
  ];

  return {
    totals,
    current: { week: currentWeek, month: currentMonth, year: currentYear },
    weekly,
    monthly,
    fastest,
    longestGap,
    maxDay,
    dropped,
    achievements,
    unknownTimestamps,
  };
}
