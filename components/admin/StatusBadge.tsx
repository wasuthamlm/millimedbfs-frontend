import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  archived: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
      )}
    >
      {status}
    </span>
  );
}
