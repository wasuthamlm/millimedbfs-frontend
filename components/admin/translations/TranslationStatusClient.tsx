"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LanguagesIcon, CheckIcon } from "@/components/ui/admin-icons";
import { getPendingItemIds, translateItem } from "@/app/admin/translations/actions";

const CONCURRENCY = 3;

type LocaleStatus = {
  code: string;
  badge: string;
  label: string;
  translatedCount: number;
};

type Section = {
  type: "ARTICLE" | "PRODUCT";
  label: string;
  total: number;
  locales: LocaleStatus[];
};

type RunState = { done: number; total: number };

export function TranslationStatusClient({ sections: initialSections }: { sections: Section[] }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const section of initialSections) {
      for (const locale of section.locales) {
        map[`${section.type}:${locale.code}`] = locale.translatedCount;
      }
    }
    return map;
  });
  const [running, setRunning] = useState<string | null>(null);
  const [progress, setProgress] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBulkTranslate = async (type: Section["type"], locale: string) => {
    const key = `${type}:${locale}`;
    setRunning(key);
    setError(null);

    try {
      const ids = await getPendingItemIds(type, locale);
      setProgress({ done: 0, total: ids.length });

      let stopped = false;
      let cursor = 0;
      let done = 0;

      const worker = async () => {
        while (!stopped) {
          const index = cursor++;
          if (index >= ids.length) return;
          const result = await translateItem(type, ids[index], locale);
          if (result.ok) {
            done++;
            setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
            setProgress({ done, total: ids.length });
          } else if (!stopped) {
            stopped = true;
            setError(result.error ?? "แปลไม่สำเร็จ");
          }
        }
      };

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ids.length) }, worker));
    } finally {
      setRunning(null);
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <LanguagesIcon className="h-6 w-6 text-brand-navy" />
        <h1 className="text-2xl font-bold text-slate-900">Translation Status</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-col gap-6">
        {initialSections.map((section) => (
          <div key={section.type} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-50 bg-slate-50/60 px-6 py-4">
              <h2 className="font-semibold text-slate-900">{section.label}</h2>
              <p className="text-xs text-slate-400">{section.total} items total</p>
            </div>

            <div className="divide-y divide-slate-50">
              {section.locales.map((locale) => {
                const key = `${section.type}:${locale.code}`;
                const translatedCount = counts[key] ?? locale.translatedCount;
                const untranslated = section.total - translatedCount;
                const pct = section.total > 0 ? Math.round((translatedCount / section.total) * 100) : 0;
                const isRunning = running === key;

                return (
                  <div key={locale.code} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex w-28 shrink-0 items-center gap-2">
                      <span className="inline-flex h-5 items-center rounded bg-slate-100 px-1.5 text-[10px] font-bold tracking-wide text-slate-500">
                        {locale.badge}
                      </span>
                      <span className="truncate text-sm font-medium text-slate-700">{locale.label}</span>
                    </div>

                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-brand-navy transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-24 shrink-0 text-right text-xs font-medium text-slate-400">
                        {translatedCount}/{section.total} ({pct}%)
                      </span>
                    </div>

                    {untranslated > 0 ? (
                      <button
                        type="button"
                        disabled={running !== null}
                        onClick={() => void handleBulkTranslate(section.type, locale.code)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-50",
                        )}
                      >
                        {isRunning ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            กำลังแปล... {progress ? `(${progress.done}/${progress.total})` : ""}
                          </>
                        ) : (
                          <>
                            <LanguagesIcon className="h-3 w-3" />
                            แปลทั้งหมด ({untranslated})
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckIcon className="h-3.5 w-3.5" />
                        ครบแล้ว
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
