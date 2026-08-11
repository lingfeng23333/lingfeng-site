import Link from "next/link";
import type { SubjectSummary } from "@/lib/types";
import { collectionLabels } from "@/lib/format";
import ProgressBar from "./ProgressBar";
import CoverImage from "./CoverImage";

export default function SubjectCard({
  subject,
}: {
  subject: SubjectSummary;
}) {
  return (
    <Link
      href={`/bangumi/${subject.id}`}
      className="glass group overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-accent-500/40"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-200">
        <CoverImage
          src={subject.cover}
          alt={subject.nameCn || subject.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full bg-white/75 px-2 py-0.5 text-[11px] text-accent-600 backdrop-blur">
          {collectionLabels[subject.collectionType]}
        </span>
        {subject.rate > 0 ? (
          <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-white">
            {subject.rate}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-medium text-ink-900">
          {subject.nameCn || subject.name}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          EP {subject.epStatus} / {subject.totalEpisodes || "?"}
        </p>
        <ProgressBar
          current={subject.epStatus}
          total={subject.totalEpisodes || 0}
          className="mt-2"
        />
      </div>
    </Link>
  );
}
