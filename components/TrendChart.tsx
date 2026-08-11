import type { TrendPoint } from "@/lib/stats";

export default function TrendChart({
  data,
  unit = "集",
}: {
  data: TrendPoint[];
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d) => (
          <div
            key={d.label}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[10px] text-ink-400 opacity-0 transition group-hover:opacity-100">
              {d.value > 0 ? `${d.value}${unit}` : ""}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-accent-500 to-flare-400 transition group-hover:opacity-80"
              style={{ height: `${Math.max(3, (d.value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 truncate text-center text-[10px] text-ink-400"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
