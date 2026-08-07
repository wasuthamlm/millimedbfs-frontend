"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SiteSettingsTab, type SiteSettingsData, type ContactInfoData, type BrandingData } from "./SiteSettingsTab";
import { GlobalThemeTab, type GlobalThemeData } from "./GlobalThemeTab";
import { LocalesTab } from "./LocalesTab";
import { AiSettingsTab, type AiSettingsData } from "./AiSettingsTab";
import { ChangePasswordForm } from "./ChangePasswordForm";

const TABS = [
  { key: "site", label: "Site Settings" },
  { key: "global", label: "Global Settings" },
  { key: "locales", label: "ภาษา · Locales" },
  { key: "ai", label: "AI Settings" },
  { key: "account", label: "บัญชีผู้ใช้" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function SettingsClient({
  siteSettings,
  contactInfo,
  branding,
  globalTheme,
  aiSettings,
}: {
  siteSettings: SiteSettingsData;
  contactInfo: ContactInfoData;
  branding: BrandingData;
  globalTheme: GlobalThemeData;
  aiSettings: AiSettingsData;
}) {
  const [tab, setTab] = useState<TabKey>("site");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "site" && (
        <SiteSettingsTab siteSettings={siteSettings} contactInfo={contactInfo} branding={branding} />
      )}
      {tab === "global" && <GlobalThemeTab initial={globalTheme} />}
      {tab === "locales" && <LocalesTab />}
      {tab === "ai" && <AiSettingsTab initial={aiSettings} />}
      {tab === "account" && <ChangePasswordForm />}
    </div>
  );
}
