import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = "navy",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  caption?: string;
  tone?: "navy" | "gold";
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            tone === "navy" ? "bg-brand-navy/10 text-brand-navy" : "bg-brand-gold/15 text-brand-gold-dark"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {caption && <p className="mt-1 text-sm text-slate-400">{caption}</p>}
      </div>
    </div>
  );
}
