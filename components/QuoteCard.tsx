"use client";

import { useState } from "react";
import type { Quote } from "@/lib/types";

export default function QuoteCard({ initial }: { initial: Quote }) {
  const [quote, setQuote] = useState<Quote>(initial);
  const [loading, setLoading] = useState(false);

  const next = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/quote");
      if (r.ok) setQuote((await r.json()) as Quote);
    } catch {
      // 保持当前名言即可
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <p className="font-display text-lg leading-relaxed text-ink-900 sm:text-xl">
        「{quote.text}」
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-500">
          {quote.character ? `${quote.character} — ` : ""}
          {quote.source ? `《${quote.source}》` : "佚名"}
        </span>
        <button
          onClick={next}
          disabled={loading}
          className="shrink-0 rounded-full border border-paper-300 px-3 py-1 text-xs text-ink-700 transition hover:border-accent-500/60 hover:text-accent-700 disabled:opacity-50"
        >
          {loading ? "换一句…" : "换一句"}
        </button>
      </div>
    </div>
  );
}
