import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import {
  getCollections,
  getEpisodeProgress,
  getEpisodes,
  getMe,
  getSubjectDetail,
  type ApiUserCollection,
} from "../lib/bangumi";
import type {
  BangumiDataFile,
  BangumiIndexFile,
  CollectionType,
  Subject,
  SubjectSummary,
} from "../lib/types";

const TOKEN = process.env.BANGUMI_TOKEN;
const USERNAME = process.env.BANGUMI_USERNAME || "966130";

if (!TOKEN) {
  console.error("缺少 BANGUMI_TOKEN，请在 .env 或环境变量中配置。");
  process.exit(1);
}

function pickCover(images?: {
  large?: string;
  common?: string;
  medium?: string;
  small?: string;
  grid?: string;
}): string {
  return images?.large || images?.common || images?.medium || images?.small || "";
}

function toSummary(subject: Subject): SubjectSummary {
  return {
    id: subject.id,
    name: subject.name,
    nameCn: subject.nameCn,
    cover: subject.cover,
    airDate: subject.airDate,
    totalEpisodes: subject.totalEpisodes,
    rating: subject.rating,
    collectionType: subject.collectionType,
    epStatus: subject.epStatus,
    rate: subject.rate,
    updatedAt: subject.updatedAt,
  };
}

function fallbackSummary(c: ApiUserCollection): SubjectSummary {
  return {
    id: c.subject_id,
    name: c.subject.name,
    nameCn: c.subject.name_cn,
    cover: pickCover(c.subject.images),
    airDate: c.subject.date,
    totalEpisodes: c.subject.total_episodes ?? c.subject.eps ?? 0,
    collectionType: c.type,
    epStatus: c.ep_status,
    rate: c.rate,
    updatedAt: c.updated_at,
  };
}

async function downloadCover(
  url: string,
  subjectId: number,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LingFengSite/0.1 (personal site)" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return null;

    const contentType = res.headers.get("content-type") || "";
    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("webp")) ext = "webp";

    const dir = path.join(process.cwd(), "public", "covers");
    await fs.mkdir(dir, { recursive: true });
    const file = `${subjectId}.${ext}`;
    await fs.writeFile(path.join(dir, file), buf);
    return `/covers/${file}`;
  } catch {
    return null;
  }
}

async function main() {
  console.log("开始同步 Bangumi 数据…");
  const me = await getMe(TOKEN!);
  const collections = await getCollections(USERNAME, TOKEN!);
  console.log(`用户：${me.nickname}（${me.id}），动画收藏 ${collections.length} 部`);

  const dataDir = path.join(process.cwd(), "data", "bangumi");
  const subjectsDir = path.join(dataDir, "subjects");
  await fs.mkdir(subjectsDir, { recursive: true });

  const summaries: SubjectSummary[] = [];
  let ok = 0;
  let failed = 0;

  for (const c of collections) {
    try {
      const [detail, episodes, progress] = await Promise.all([
        getSubjectDetail(c.subject_id, TOKEN!),
        getEpisodes(c.subject_id, TOKEN!),
        getEpisodeProgress(c.subject_id, TOKEN!),
      ]);

      const watchMeta = new Map(progress.map((p) => [p.episode.id, p]));
      const remoteCover =
        detail.images?.large ||
        detail.images?.common ||
        c.subject.images?.large ||
        c.subject.images?.common ||
        "";
      const localCover = remoteCover
        ? await downloadCover(remoteCover, c.subject_id)
        : null;
      const subject: Subject = {
        id: c.subject_id,
        name: detail.name || c.subject.name,
        nameCn: detail.name_cn || c.subject.name_cn,
        cover: localCover || pickCover(detail.images ?? c.subject.images),
        coverRemote: remoteCover || undefined,
        airDate: detail.date || c.subject.date,
        totalEpisodes:
          detail.total_episodes ?? detail.eps ?? c.subject.total_episodes ?? c.subject.eps ?? 0,
        rating: {
          score: detail.rating?.score,
          rank: detail.rating?.rank,
          total: detail.rating?.total,
        },
        summary: detail.summary || "",
        tags: (detail.tags ?? []).map((t) => t.name).slice(0, 12),
        platform: detail.platform,
        nsfw: detail.nsfw,
        collectionType: c.type as CollectionType,
        epStatus: c.ep_status,
        volStatus: c.vol_status,
        rate: c.rate,
        comment: c.comment,
        private: c.private,
        updatedAt: c.updated_at,
        episodes: episodes.map((e) => ({
          id: e.id,
          ep: e.ep ?? null,
          sort: e.sort,
          type: e.type,
          name: e.name,
          nameCn: e.name_cn,
          airdate: e.airdate,
          watchStatus: watchMeta.get(e.id)?.type ?? 0,
          durationSeconds: e.duration_seconds ?? 0,
          watchedAt: watchMeta.get(e.id)?.updated_at ?? 0,
        })),
      };

      await fs.writeFile(
        path.join(subjectsDir, `${subject.id}.json`),
        JSON.stringify(subject, null, 2),
        "utf8",
      );
      summaries.push(toSummary(subject));
      ok++;
    } catch (err) {
      failed++;
      summaries.push(fallbackSummary(c));
      console.error(
        `[skip] ${c.subject_id} ${c.subject.name_cn || c.subject.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const typeOrder: Record<number, number> = { 3: 0, 2: 1, 1: 2, 4: 3, 5: 4 };
  summaries.sort(
    (a, b) =>
      (typeOrder[a.collectionType] ?? 9) - (typeOrder[b.collectionType] ?? 9) ||
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );

  const lastSyncAt = new Date().toISOString();
  const dataFile: BangumiDataFile = {
    lastSyncAt,
    user: {
      id: me.id,
      username: me.username,
      nickname: me.nickname,
      sign: me.sign,
      avatar: me.avatar?.large,
      url: me.url,
    },
  };
  const indexFile: BangumiIndexFile = { lastSyncAt, subjects: summaries };

  await fs.writeFile(
    path.join(dataDir, "user.json"),
    JSON.stringify(dataFile, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(dataDir, "index.json"),
    JSON.stringify(indexFile, null, 2),
    "utf8",
  );

  console.log(
    `同步完成：成功 ${ok} / 失败 ${failed}，总计 ${collections.length} 部，数据已写入 data/bangumi。`,
  );
}

main().catch((err) => {
  console.error("同步失败：", err);
  process.exit(1);
});
