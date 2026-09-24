"use client";

// Full Google Consent Mode v2 banner + settings dialog, ported from the legacy site's
// src/components/public/CookieConsent.jsx (necessary/analytics/marketing categories,
// Accept all / Reject all / Customize, footer re-entry point, focus trap). Restyled to
// this project's brand tokens instead of the legacy teal palette. Text is hardcoded
// Thai only — this project has no i18n system (the legacy source keeps 9 locales via an
// admin-editable SiteSetting; out of scope here).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useConsent } from "@/lib/consent/useConsent";
import { getConsent } from "@/lib/consent/consentStore";
import { subscribeOpenCookieSettings } from "@/lib/consent/openCookieSettings";

const STRINGS = {
  title: "เราใช้คุกกี้",
  message:
    "เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพการใช้งานและวิเคราะห์การเข้าชม โดยคุณสามารถจัดการความยินยอมได้ตามต้องการ",
  accept: "ยอมรับทั้งหมด",
  reject: "ปฏิเสธ",
  settings: "ตั้งค่า",
  save: "บันทึกการตั้งค่า",
  necessary: "คุกกี้ที่จำเป็น",
  necessaryDesc: "จำเป็นต่อการทำงานพื้นฐานของเว็บไซต์ ไม่สามารถปิดได้",
  analytics: "คุกกี้เพื่อการวิเคราะห์",
  analyticsDesc: "ช่วยให้เราเข้าใจการใช้งานเว็บไซต์เพื่อปรับปรุงประสบการณ์",
  marketing: "คุกกี้เพื่อการตลาด",
  marketingDesc: "ใช้เพื่อแสดงเนื้อหาและโฆษณาที่เกี่ยวข้องกับคุณ",
  always: "เปิดเสมอ",
  close: "ปิด",
  savedNotice: "บันทึกการตั้งค่าคุกกี้ของคุณแล้ว",
};

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/cookie-policy", label: "นโยบายการใช้คุกกี้" },
];

export function CookieConsent() {
  const { consentReady, decided, saveConsent } = useConsent();

  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });
  const [savedNotice, setSavedNotice] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Footer link → reopen the settings dialog at any time, preloaded with the stored
  // record. Reads consent inside the callback so the subscription registers once and
  // never misses a click made before this effect ran.
  useEffect(
    () =>
      subscribeOpenCookieSettings(() => {
        lastFocused.current = document.activeElement as HTMLElement | null;
        const current = getConsent();
        setPrefs({ analytics: current.analytics === true, marketing: current.marketing === true });
        setSavedNotice(false);
        setShowSettings(true);
      }),
    [],
  );

  // Banner and dialog are independent: the banner only greets undecided visitors,
  // while the dialog is available at any time — including after a decision was made.
  const showBanner = consentReady && !decided;
  const open = showBanner || showSettings;

  // Focus management + Escape (Escape closes the dialog without recording consent)
  useEffect(() => {
    if (!showSettings) return;
    const node = dialogRef.current;
    node?.querySelector("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSettings(false);
        lastFocused.current?.focus?.();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = node.querySelectorAll<HTMLElement>("button, a[href], input");
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showSettings]);

  const persist = (value: { analytics: boolean; marketing: boolean }) => {
    const result = saveConsent(value);
    setShowSettings(false);
    if (!result.reloaded) {
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 3000);
    }
    lastFocused.current?.focus?.();
  };

  const acceptAll = () => persist({ analytics: true, marketing: true });
  const rejectAll = () => persist({ analytics: false, marketing: false });
  const saveCustom = () => persist(prefs);

  if (savedNotice && !open) {
    return (
      <div role="status" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white px-5 py-3 text-sm text-slate-500 shadow-2xl">
          {STRINGS.savedNotice}
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="pointer-events-auto mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        {!showSettings ? (
          <div className="p-5 sm:p-6" role="region" aria-label={STRINGS.title}>
            <div className="mb-3 flex items-start gap-3">
              <div className="flex-1">
                <h3 className="mb-1 text-base font-semibold text-slate-900">{STRINGS.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{STRINGS.message}</p>
                <PolicyLinks />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  lastFocused.current = document.activeElement as HTMLElement | null;
                  setPrefs({ analytics: false, marketing: false });
                  setShowSettings(true);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
              >
                {STRINGS.settings}
              </button>
              <button
                onClick={rejectAll}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
              >
                {STRINGS.reject}
              </button>
              <button
                onClick={acceptAll}
                className="rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
              >
                {STRINGS.accept}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            ref={dialogRef}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="cookie-settings-title" className="text-base font-semibold text-slate-900">
                {STRINGS.settings}
              </h3>
              <button
                onClick={() => {
                  setShowSettings(false);
                  lastFocused.current?.focus?.();
                }}
                aria-label={STRINGS.close}
                className="rounded text-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
              >
                ✕
              </button>
            </div>
            <div className="mb-5 space-y-3">
              <CookieRow title={STRINGS.necessary} desc={STRINGS.necessaryDesc} checked disabled alwaysLabel={STRINGS.always} />
              <CookieRow
                title={STRINGS.analytics}
                desc={STRINGS.analyticsDesc}
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <CookieRow
                title={STRINGS.marketing}
                desc={STRINGS.marketingDesc}
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>
            <PolicyLinks />
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                onClick={rejectAll}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
              >
                {STRINGS.reject}
              </button>
              <button
                onClick={saveCustom}
                className="rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
              >
                {STRINGS.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PolicyLinks() {
  return (
    <div className="mt-3 flex flex-wrap gap-4">
      {POLICY_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded text-xs text-slate-500 underline hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function CookieRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
  alwaysLabel,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  alwaysLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{desc}</p>
      </div>
      {disabled ? (
        <span className="mt-0.5 whitespace-nowrap text-xs font-medium text-brand-navy">{alwaysLabel}</span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          onClick={() => onChange?.(!checked)}
          className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/40 ${
            checked ? "bg-brand-navy" : "bg-slate-300"
          }`}
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
            style={{ transform: checked ? "translateX(18px)" : "translateX(3px)" }}
          />
        </button>
      )}
    </div>
  );
}
