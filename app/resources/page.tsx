import type { Metadata } from "next";
import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { getResources } from "@/lib/resources";

export const metadata: Metadata = {
  title: "资源",
  description: "站内收录的长篇资源库。",
};

export default function ResourcesPage() {
  const resources = getResources();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink-900">资源</h1>
        <p className="mt-2 text-sm text-ink-500">
          收录一些适合在站内慢慢读的长篇，共 {resources.length} 部。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <Link
            key={r.id}
            href={`/resources/${r.id}`}
            className="glass group overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-accent-500/40"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-200">
              <CoverImage
                src={r.cover}
                alt={r.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-accent-600 shadow">
                #{r.number}
              </span>
            </div>
            <div className="p-4">
              <h2 className="line-clamp-1 font-display text-base font-semibold text-ink-900">
                {r.title}
              </h2>
              {r.subtitle ? (
                <p className="mt-1 text-xs text-ink-500">{r.subtitle}</p>
              ) : null}
              {r.description ? (
                <p className="mt-2 line-clamp-2 text-xs text-ink-500">
                  {r.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs font-medium text-accent-600">
                {r.chapters.length} 章 · 开始阅读 →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
