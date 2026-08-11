import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function pickLocalWallpaper(): string | null {
  const dir = path.join(process.cwd(), "public", "wallpapers");
  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp|avif|svg)$/i.test(f));
    if (files.length === 0) return null;
    return files[Math.floor(Math.random() * files.length)];
  } catch {
    return null;
  }
}

interface WallpaperResult {
  url: string;
  credit: string | null;
}

async function fetchRemoteWallpaper(
  remoteUrl: string,
): Promise<WallpaperResult | null> {
  try {
    const res = await fetch(remoteUrl, {
      headers: { Accept: "application/json,image/*" },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      return { url: res.url, credit: null };
    }

    const data = await res.json().catch(() => null);
    if (!data) return null;

    const item = Array.isArray(data?.data) ? data.data[0] : null;
    const imageUrl =
      item?.urls?.regular ||
      item?.urls?.original ||
      data?.urls?.regular ||
      data?.url ||
      item?.url ||
      data?.data?.url ||
      null;
    if (typeof imageUrl !== "string") return null;

    const author = item?.author || data?.author || data?.artist || null;
    return { url: imageUrl, credit: author ? `illust by ${author}` : null };
  } catch {
    return null;
  }
}

const REMOTE_SOURCES: { build: () => string }[] = [
  {
    build: () => "https://api.nyan.xyz/animeapi/v2/img?type=pc",
  },
  {
    build: () => "https://t.alcy.cc/moez",
  },
];

async function fetchWallhaven(): Promise<WallpaperResult | null> {
  try {
    const res = await fetch(
      "https://wallhaven.cc/api/v1/search?categories=010&purity=100&sorting=random&atleast=1920x1080&ratios=landscape",
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const item = Array.isArray(data?.data) ? data.data[0] : null;
    if (!item?.path) return null;
    return {
      url: item.path,
      credit: item.resolution
        ? `wallhaven.cc · ${item.resolution}`
        : "wallhaven.cc",
    };
  } catch {
    return null;
  }
}

interface PixivItem {
  width?: number;
  height?: number;
  author?: string;
  urls?: { regular?: string };
}

async function fetchPixivLandscape(): Promise<WallpaperResult | null> {
  try {
    const url =
      "https://api.lolicon.app/setu/v2?r18=0&num=10&size=regular&tag=" +
      encodeURIComponent("壁紙");
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as {
      data?: PixivItem[];
    } | null;
    const items = Array.isArray(data?.data) ? data.data : [];
    const landscape = items.filter(
      (d) =>
        d?.width &&
        d?.height &&
        d.width > d.height &&
        d.width / d.height >= 1.3,
    );
    const pick =
      landscape.length > 0
        ? landscape[Math.floor(Math.random() * landscape.length)]
        : null;
    if (!pick?.urls?.regular) return null;
    return {
      url: pick.urls.regular,
      credit: pick.author ? `Pixiv · ${pick.author}` : "Pixiv",
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const envUrl = process.env.WALLPAPER_API;
  if (envUrl) {
    const hit = await fetchRemoteWallpaper(envUrl);
    if (hit) return NextResponse.json(hit);
  }

  const candidates: Promise<WallpaperResult>[] = [
    fetchPixivLandscape().then((r) =>
      r ? r : Promise.reject(new Error("empty")),
    ),
    fetchWallhaven().then((r) =>
      r ? r : Promise.reject(new Error("empty")),
    ),
    ...REMOTE_SOURCES.map((source) =>
      fetchRemoteWallpaper(source.build()).then((r) =>
        r ? r : Promise.reject(new Error("empty")),
      ),
    ),
  ];

  try {
    const hit = await Promise.any(candidates);
    return NextResponse.json(hit);
  } catch {
    // 所有远程源都失败时走本地兜底
  }

  const local = pickLocalWallpaper();
  return NextResponse.json({
    url: local ? `/wallpapers/${encodeURIComponent(local)}` : null,
    credit: null,
  });
}
