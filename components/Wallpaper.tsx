"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface WallpaperPayload {
  url: string | null;
  credit?: string | null;
}

export default function Wallpaper() {
  const [bg, setBg] = useState<WallpaperPayload | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/wallpaper?t=${Date.now()}`);
      if (r.ok) setBg((await r.json()) as WallpaperPayload);
    } catch {
      // 保持当前背景即可
    }
  }, []);

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
            onError={() => setBg({ url: null })}
            className="scale-110 object-cover opacity-90 blur-3xl"
          />
          <Image
            src={bg.url}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            onError={() => setBg({ url: null })}
            className="object-contain"
          />
        </div>
      ) : null}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-b from-white/55 via-white/35 to-white/80"
      />
      {bg?.url && bg.credit ? (
        <p className="fixed bottom-3 right-4 z-30 text-xs text-ink-500">
          {bg.credit}
        </p>
      ) : null}
    </>
  );
}
