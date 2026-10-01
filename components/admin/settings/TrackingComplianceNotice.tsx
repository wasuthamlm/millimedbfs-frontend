"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { sanitizeGa4Id, sanitizeGtmId, sanitizeMetaPixelId, sanitizeTiktokPixelId } from "@/lib/tracking-ids";

/** Format warnings for the tracking IDs plus how measurement is wired (legacy TrackingComplianceNotice). */
export function TrackingComplianceNotice({
  values,
}: {
  values: { gtmId: string; ga4Id: string; fbPixelId: string; tiktokPixelId: string };
}) {
  const [open, setOpen] = useState(false);
  const checks = [
    { label: "GTM Container ID", value: values.gtmId, valid: sanitizeGtmId(values.gtmId), format: "GTM-XXXXXXX" },
    { label: "GA4 Measurement ID", value: values.ga4Id, valid: sanitizeGa4Id(values.ga4Id), format: "G-XXXXXXXXXX หรือเว้นว่าง" },
    { label: "Facebook Pixel ID", value: values.fbPixelId, valid: sanitizeMetaPixelId(values.fbPixelId), format: "ตัวเลขเท่านั้น" },
    { label: "TikTok Pixel ID", value: values.tiktokPixelId, valid: sanitizeTiktokPixelId(values.tiktokPixelId), format: "ตัวอักษร/ตัวเลข" },
  ];
  // Blank = not configured = no warning.
  const invalid = checks.filter((c) => c.value.trim() && !c.valid);

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      {invalid.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold">ค่าต่อไปนี้รูปแบบไม่ถูกต้อง — ระบบจะไม่โหลดสคริปต์นั้นบนเว็บไซต์</p>
          {invalid.map((c) => (
            <p key={c.label}>
              • {c.label}: ต้องเป็นรูปแบบ {c.format}
            </p>
          ))}
        </div>
      )}
      <div className="rounded-lg border border-blue-100 bg-blue-50">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 p-3 text-left">
          <span className="flex-1 text-xs font-semibold text-blue-900">ระบบวัดผลทำงานอย่างไร</span>
          <ChevronDown className={cn("h-4 w-4 text-blue-600 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="flex flex-col gap-1.5 px-3 pb-3 text-xs text-blue-900">
            <p>• Google tags ทั้งหมด (รวม GA4) ยิงผ่าน GTM เท่านั้น — เว็บไซต์ไม่โหลด gtag.js เองเพื่อไม่ให้นับซ้ำ</p>
            <p>• GA4 Measurement ID ในช่องนี้ใช้ส่งให้ GTM ผ่าน dataLayer (event <code>millimedbfs_measurement_config_ready</code>) — เว้นว่างได้ถ้า GA4 ตั้งไว้ใน GTM แล้ว</p>
            <p>• Facebook / TikTok Pixel โหลดหลังผู้เข้าชมยินยอมคุกกี้การตลาด และเฉพาะหน้าที่เปิด “อนุญาต Meta / TikTok Pixel” เท่านั้น</p>
            <p>• ลิงก์นโยบายความเป็นส่วนตัว/คุกกี้ ตั้งค่าได้ที่ Cookie Consent — ระบบไม่สร้างเนื้อหานโยบายแทนบริษัท</p>
          </div>
        )}
      </div>
    </div>
  );
}
