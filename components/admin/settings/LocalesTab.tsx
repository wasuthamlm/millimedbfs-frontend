"use client";

import Link from "next/link";
import { TRANSLATION_LOCALES } from "@/lib/translation-locales";

export function LocalesTab() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">ภาษา · Locales</h2>
        <p className="mt-1 text-sm text-slate-500">
          ภาษาที่ระบบรองรับสำหรับแปลบทความและสินค้าโดยอัตโนมัติ (ไทยเป็นภาษาต้นทางเสมอ)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TRANSLATION_LOCALES.map((locale) => (
          <div
            key={locale.code}
            className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
          >
            <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-white text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
              {locale.badge}
            </span>
            <span className="truncate text-sm font-medium text-slate-700">{locale.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        จัดการสถานะการแปลและสั่งแปลได้ที่หน้า{" "}
        <Link href="/admin/translations" className="font-medium text-brand-navy hover:underline">
          แปลภาษา
        </Link>
        {" "}— รายการภาษานี้กำหนดไว้ในโค้ด (lib/translation-locales.ts) เพื่อความสอดคล้องกับ prompt ที่ใช้แปล
      </p>
    </div>
  );
}
