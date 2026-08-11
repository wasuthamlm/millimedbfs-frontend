"use client";

import { useState } from "react";
import { CheckIcon, XCircleIcon } from "@/components/ui/admin-icons";
import { cn } from "@/lib/utils";
import type { SeoAeoGeoResult, SeoCategoryResult } from "@/lib/seo-score";

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500 text-emerald-700";
  if (score >= 50) return "bg-amber-500 text-amber-700";
  return "bg-red-500 text-red-700";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const [barClass, textClass] = barColor(score).split(" ");
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn("text-2xl font-bold", textClass)}>{score}</span>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", barClass)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function CategoryChecklist({
  title,
  subtitle,
  result,
}: {
  title: string;
  subtitle: string;
  result: SeoCategoryResult;
}) {
  const [textClass] = barColor(result.score).split(" ");
  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <span className={cn("text-sm font-bold", textClass)}>{result.score}/100</span>
      </div>
      <ul className="flex flex-col gap-2">
        {result.checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2">
            {check.passed ? (
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            )}
            <div>
              <p className={cn("text-sm", check.passed ? "text-slate-700" : "text-slate-600")}>{check.label}</p>
              <p className="text-xs text-slate-400">{check.hint}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SeoScorePanel({ result }: { result: SeoAeoGeoResult }) {
  const [tab, setTab] = useState<"seo" | "aeo" | "geo">("seo");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-3 gap-4">
        <ScoreBar label="SEO" score={result.seo.score} />
        <ScoreBar label="AEO" score={result.aeo.score} />
        <ScoreBar label="GEO" score={result.geo.score} />
      </div>

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        SEO คำนวณจากแนวทางของ RankMath ส่วน AEO/GEO เป็นเกณฑ์ประมาณการที่ประเมินจากข้อมูลหน้านี้เอง ไม่ใช่มาตรฐานอุตสาหกรรม
      </p>

      <div className="flex gap-1 border-b border-slate-100">
        {(
          [
            ["seo", "SEO — ค้นหาบน Google"],
            ["aeo", "AEO — ตอบคำถาม/AI Overview"],
            ["geo", "GEO — ถูกอ้างอิงโดย AI"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors",
              tab === key ? "border-b-2 border-brand-navy text-brand-navy" : "text-slate-400 hover:text-slate-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "seo" && (
        <CategoryChecklist title="SEO — ค้นหาบน Google" subtitle="อ้างอิงเกณฑ์ RankMath" result={result.seo} />
      )}
      {tab === "aeo" && (
        <CategoryChecklist title="AEO — ตอบคำถาม/AI Overview" subtitle="เกณฑ์ประมาณการ" result={result.aeo} />
      )}
      {tab === "geo" && (
        <CategoryChecklist title="GEO — ถูกอ้างอิงโดย AI" subtitle="เกณฑ์ประมาณการ" result={result.geo} />
      )}
    </div>
  );
}
