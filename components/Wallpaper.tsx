"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface WallpaperPayload {
  url: string | null;
  credit?: string | null;
}

export default function Wallpaper() {
  const [bg, setBg] = useState<WallpaperPayload | null>(null);
  const portraitRetry = useRef(false);
  const errorRetry = useRef(false);

  const load = useCallback(async (force = false) => {
    try {
      const r = await fetch(
        `/api/wallpaper?t=${Date.now()}${force ? "&refresh=1" : ""}`,
      );
      if (r.ok) setBg((await r.json()) as WallpaperPayload);
    } catch {
      // 保持当前背景即可
    }
  }, []);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth <= 0) return;
    if (img.naturalWidth < img.naturalHeight) {
      // 竖图不适合铺满，换一张（每张最多重试一次，避免死循环）
      if (!portraitRetry.current) {
        portraitRetry.current = true;
        load(true);
      }
    } else {
      portraitRetry.current = false;
      errorRetry.current = false;
    }
  };

  const handleError = () => {
    if (!errorRetry.current) {
      errorRetry.current = true;
      load(true);
    } else {
      setBg(null);
    }
  };

  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, 300000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-paper-50"
      />
      {bg?.url ? (
        <div key={bg.url} aria-hidden className="bg-fade fixed inset-0 -z-10">
          <Image
            src={bg.url}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            onError={handleError}
            onLoad={handleLoad}
            className="bg-kenburns object-cover"
          />
        </div>
      ) : null}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-b from-white/70 via-white/55 to-white/85"
      />
      {bg?.url && bg.credit ? (
        <p className="fixed bottom-3 right-4 z-30 max-w-[45vw] truncate text-xs text-ink-700 drop-shadow-sm">
          {bg.credit}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => load(true)}
        className="fixed bottom-3 left-4 z-30 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs text-ink-700 shadow-sm backdrop-blur transition hover:border-accent-500/50 hover:text-accent-600"
      >
        换壁纸
      </button>
    </>
  );
}
