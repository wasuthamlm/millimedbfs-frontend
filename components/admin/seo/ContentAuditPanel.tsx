"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { computeContentAudit } from "@/lib/content-audit";

function MiniCircle({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : "#dc2626";
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative h-10 w-10">
        <svg width="40" height="40" className="-rotate-90" aria-hidden="true">
          <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circ}
            strokeDashoffset={circ - (score / 100) * circ}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}

/** Live SEO / AEO-GEO / Perf score for the article and product forms. */
export function ContentAuditPanel(props: Parameters<typeof computeContentAudit>[0]) {
  const [open, setOpen] = useState(false);
  const audit = useMemo(() => computeContentAudit(props), [props]);
  const tone =
    audit.overall >= 80
      ? "border-green-100 bg-green-50 text-green-600"
      : audit.overall >= 60
        ? "border-yellow-100 bg-yellow-50 text-yellow-600"
        : "border-red-100 bg-red-50 text-red-600";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className={cn("shrink-0 rounded-lg border px-3 py-1.5 text-center", tone)}>
          <p className="text-lg font-bold leading-none">{audit.overall}</p>
          <p className="text-[9px] font-medium">คะแนนรวม</p>
        </div>
        <div className="flex items-center gap-3">
          <MiniCircle label="SEO" score={audit.seo} />
          <MiniCircle label="AEO/GEO" score={audit.aeo} />
          <MiniCircle label="Perf" score={audit.perf} />
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-slate-500 hover:text-brand-navy"
        >
          {audit.issues.length > 0 ? `ต้องแก้ไข ${audit.issues.length} ข้อ` : "ไม่พบปัญหา"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <ul className="max-h-60 overflow-y-auto border-t border-slate-100 px-4 py-2">
          {audit.issues.length === 0 ? (
            <li className="py-1 text-xs text-green-600">คุณภาพสมบูรณ์ตามเกณฑ์ Google</li>
          ) : (
            audit.issues.map((issue, i) => (
              <li key={i} className="flex gap-2 border-b border-slate-50 py-1.5 text-xs last:border-0">
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    issue.level === "error" ? "bg-red-500" : issue.level === "warn" ? "bg-yellow-400" : "bg-blue-400",
                  )}
                />
                <span>
                  <span className="font-semibold uppercase text-slate-400">{issue.cat} · </span>
                  <span className="text-slate-600">{issue.text}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
