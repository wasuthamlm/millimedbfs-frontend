"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { Toggle } from "@/components/admin/Toggle";
import { ALL_LOCALES, DEFAULT_LOCALE, localeInfo } from "@/lib/i18n/locales";
import { saveLanguages } from "@/app/admin/settings/actions";

export type LanguageRow = { code: string; labelLocal: string; enabled: boolean };

/** Enable/disable, rename and order the public site's languages (legacy LanguagesTab). */
export function LocalesTab({ initial }: { initial: LanguageRow[] }) {
  // Always show every supported locale, even ones missing from the table.
  const [rows, setRows] = useState<LanguageRow[]>(() => [
    ...initial,
    ...ALL_LOCALES.filter((l) => !initial.some((r) => r.code === l.code)).map((l) => ({ code: l.code, labelLocal: l.label, enabled: false })),
  ]);
  const [error, setError] = useState<string | null>(null);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };
  const update = (code: string, patch: Partial<LanguageRow>) => setRows((rs) => rs.map((r) => (r.code === code ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">ภาษา · Locales</h2>
        <p className="mt-1 text-sm text-slate-500">
          เปิด/ปิดภาษาบนหน้าเว็บ (URL เช่น /en/…) และในตัวเลือกภาษา — ภาษาไทยเป็นภาษาหลักและปิดไม่ได้
        </p>
      </div>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
        {rows.map((row, i) => (
          <li key={row.code} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="text-xl" aria-hidden="true">{localeInfo(row.code).flag}</span>
            <span className="w-10 font-mono text-xs uppercase text-slate-400">{row.code}</span>
            <input
              value={row.labelLocal}
              onChange={(e) => update(row.code, { labelLocal: e.target.value })}
              aria-label={`ชื่อภาษา ${row.code}`}
              className="w-44 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            />
            <span className="ml-auto flex items-center gap-3">
              <Toggle
                checked={row.code === DEFAULT_LOCALE || row.enabled}
                disabled={row.code === DEFAULT_LOCALE}
                onChange={(v) => update(row.code, { enabled: v })}
              />
              <button type="button" aria-label="เลื่อนขึ้น" onClick={() => move(i, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button type="button" aria-label="เลื่อนลง" onClick={() => move(i, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <ArrowDownIcon className="h-4 w-4" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaveButton
          label="บันทึกภาษา"
          onSave={async () => {
            setError(null);
            const res = await saveLanguages(rows);
            if (res.error) {
              setError(res.error);
              throw new Error(res.error);
            }
          }}
        />
        <p className="text-xs text-slate-400">
          สั่งแปลเนื้อหาได้ที่หน้า{" "}
          <Link href="/admin/translations" className="font-medium text-brand-navy hover:underline">
            แปลภาษา
          </Link>{" "}
          — การเปลี่ยนแปลงมีผลกับหน้าเว็บภายใน 1 นาที
        </p>
      </div>
    </div>
  );
}
