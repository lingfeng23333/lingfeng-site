export default function ProgressBar({
  current,
  total,
  className = "",
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const pct =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-paper-200 ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-flare-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
