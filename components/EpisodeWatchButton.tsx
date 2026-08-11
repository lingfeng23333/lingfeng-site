"use client";

import { useState } from "react";

export default function EpisodeWatchButton({
  subjectId,
  episodeId,
  initialStatus,
}: {
  subjectId: number;
  episodeId: number;
  initialStatus: number;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const watched = status === 2;

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bangumi/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          episodeId,
          type: watched ? 0 : 2,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "写回 Bangumi 失败",
        );
      }
      setStatus(watched ? 0 : 2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "写回 Bangumi 失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        className={`shrink-0 rounded-full border px-3 py-1 text-xs transition disabled:opacity-50 ${
          watched
            ? "border-accent-500/40 bg-accent-500/10 text-accent-600 hover:bg-accent-500/20"
            : "border-paper-300 text-ink-500 hover:border-accent-500/50 hover:text-accent-600"
        }`}
      >
        {busy ? "同步中…" : watched ? "取消已看" : "标记已看"}
      </button>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  );
}
