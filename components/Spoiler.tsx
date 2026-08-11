"use client";

import { useState } from "react";

export default function Spoiler({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-600 transition hover:bg-amber-100"
      >
        ⚠ 包含剧透 · 点击展开
      </button>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      {children}
    </div>
  );
}
