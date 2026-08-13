"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const chevronLeft = (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

const chevronRight = (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export default function ScrollRow({
  children,
}: {
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollByStep = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-scroll-card]");
    const step = (card ? card.offsetWidth + 16 : el.clientWidth * 0.8) * direction;
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  return (
    <div className="relative mt-4">
      <div
        ref={trackRef}
        className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto scroll-smooth px-1 pb-2 pt-1"
      >
        {children}
      </div>

      {canPrev ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-2xl bg-gradient-to-r from-white/95 to-transparent" />
      ) : null}
      {canNext ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-2xl bg-gradient-to-l from-white/95 to-transparent" />
      ) : null}

      {canPrev ? (
        <button
          type="button"
          onClick={() => scrollByStep(-1)}
          aria-label="向前滚动"
          className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-paper-300 bg-white/85 text-ink-700 shadow-sm backdrop-blur transition hover:border-accent-500/60 hover:text-accent-600"
        >
          {chevronLeft}
        </button>
      ) : null}
      {canNext ? (
        <button
          type="button"
          onClick={() => scrollByStep(1)}
          aria-label="向后滚动"
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-paper-300 bg-white/85 text-ink-700 shadow-sm backdrop-blur transition hover:border-accent-500/60 hover:text-accent-600"
        >
          {chevronRight}
        </button>
      ) : null}
    </div>
  );
}
