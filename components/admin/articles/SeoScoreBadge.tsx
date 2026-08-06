import { cn } from "@/lib/utils";

export function SeoScoreBadge({ score }: { score: number }) {
  const style =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : score >= 50
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-red-50 text-red-700 ring-1 ring-red-200";

  return (
    <span
      title="คะแนน SEO (คำนวณตามแนวทาง RankMath)"
      className={cn("inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold", style)}
    >
      {score}
    </span>
  );
}
