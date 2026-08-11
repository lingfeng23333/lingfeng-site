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
      signal: AbortSignal.timeout(9000),
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
    build: () => "https://api.lolicon.app/setu/v2?r18=0&num=1&size=regular",
  },
  {
    build: () => "https://api.nyan.xyz/animeapi/v2/img?type=pc",
  },
  {
    build: () => "https://t.alcy.cc/moez",
  },
];

export async function GET() {
  const envUrl = process.env.WALLPAPER_API;
  if (envUrl) {
    const hit = await fetchRemoteWallpaper(envUrl);
    if (hit) return NextResponse.json(hit);
  }

  for (const source of REMOTE_SOURCES) {
    const hit = await fetchRemoteWallpaper(source.build());
    if (hit) return NextResponse.json(hit);
  }

  const local = pickLocalWallpaper();
  return NextResponse.json({
    url: local ? `/wallpapers/${encodeURIComponent(local)}` : null,
    credit: null,
  });
}
