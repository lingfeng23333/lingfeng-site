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

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/wallpaper?t=${Date.now()}`);
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
        load();
      }
    } else {
      portraitRetry.current = false;
      errorRetry.current = false;
    }
  };

  const handleError = () => {
    if (!errorRetry.current) {
      errorRetry.current = true;
      load();
    } else {
      setBg(null);
    }
  };

  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, 30000);
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
            className="object-cover"
          />
        </div>
      ) : null}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-b from-white/65 via-white/45 to-white/80 backdrop-blur-[2px]"
      />
      {bg?.url && bg.credit ? (
        <p className="fixed bottom-3 right-4 z-30 text-xs text-ink-500">
          {bg.credit}
        </p>
      ) : null}
    </>
  );
}
