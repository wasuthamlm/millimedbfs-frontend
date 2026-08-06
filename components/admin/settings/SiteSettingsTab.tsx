"use client";

import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { Select } from "@/components/admin/Select";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  saveGeneralSettings,
  saveHomepageSettings,
  saveContactInfo,
  saveBrandingSettings,
  saveAnalyticsSettings,
  saveSeoDefaults,
  saveSocialSettings,
  saveSiteAssets,
} from "@/app/admin/settings/actions";

export type SiteSettingsData = {
  siteNameTh: string;
  siteNameEn: string;
  siteUrl: string;
  youtubeEmbedUrl: string;
  gtmId: string;
  ga4Id: string;
  fbPixelId: string;
  tiktokPixelId: string;
  seoMetaTitleTh: string;
  seoMetaDescTh: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  lineUrl: string;
  socialIconStyle: string;
  showSocialInHeader: boolean;
  siteLogoUrl: string;
  faviconUrl: string;
  loginBgUrl: string;
};

export type ContactInfoData = {
  companyNameTh: string;
  companyNameEn: string;
  taxId: string;
  addressTh: string;
  addressEn: string;
  phone: string;
  email: string;
  lineId: string;
  googleMapsEmbedUrl: string;
};

export type BrandingData = { taglineTh: string; taglineEn: string };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

function Card({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => Promise<void> }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
      <div>
        <SaveButton onSave={onSave} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  full,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className={labelClass}>{label}</label>
      <input className={inputClass} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <label className={labelClass}>{label}</label>
      <textarea
        className={inputClass}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const SOCIAL_ICON_STYLE_OPTIONS = [
  { value: "circle-outline", label: "วงกลมโปร่ง (ค่าเริ่มต้น)" },
  { value: "circle-filled", label: "วงกลมทึบ" },
  { value: "square", label: "สี่เหลี่ยม" },
  { value: "plain", label: "ไอคอนล้วน (ไม่มีพื้นหลัง)" },
];

const SHOW_HEADER_OPTIONS = [
  { value: "hide", label: "ไม่แสดง" },
  { value: "show", label: "แสดง" },
];

export function SiteSettingsTab({
  siteSettings,
  contactInfo,
  branding,
}: {
  siteSettings: SiteSettingsData;
  contactInfo: ContactInfoData;
  branding: BrandingData;
}) {
  const [general, setGeneral] = useState({
    siteNameTh: siteSettings.siteNameTh,
    siteNameEn: siteSettings.siteNameEn,
    siteUrl: siteSettings.siteUrl,
  });
  const [homepage, setHomepage] = useState({ youtubeEmbedUrl: siteSettings.youtubeEmbedUrl });
  const [contact, setContact] = useState(contactInfo);
  const [brand, setBrand] = useState(branding);
  const [analytics, setAnalytics] = useState({
    gtmId: siteSettings.gtmId,
    ga4Id: siteSettings.ga4Id,
    fbPixelId: siteSettings.fbPixelId,
    tiktokPixelId: siteSettings.tiktokPixelId,
  });
  const [seo, setSeo] = useState({ seoMetaTitleTh: siteSettings.seoMetaTitleTh, seoMetaDescTh: siteSettings.seoMetaDescTh });
  const [social, setSocial] = useState({
    facebookUrl: siteSettings.facebookUrl,
    instagramUrl: siteSettings.instagramUrl,
    youtubeUrl: siteSettings.youtubeUrl,
    tiktokUrl: siteSettings.tiktokUrl,
    lineUrl: siteSettings.lineUrl,
    socialIconStyle: siteSettings.socialIconStyle,
    showSocialInHeader: siteSettings.showSocialInHeader,
  });
  const [assets, setAssets] = useState({
    siteLogoUrl: siteSettings.siteLogoUrl,
    faviconUrl: siteSettings.faviconUrl,
    loginBgUrl: siteSettings.loginBgUrl,
  });

  return (
    <div className="flex flex-col gap-6">
      <Card title="General" onSave={() => saveGeneralSettings(general).then(() => {})}>
        <Field label="Site Name TH" value={general.siteNameTh} onChange={(v) => setGeneral((s) => ({ ...s, siteNameTh: v }))} />
        <Field label="Site Name EN" value={general.siteNameEn} onChange={(v) => setGeneral((s) => ({ ...s, siteNameEn: v }))} />
        <Field
          label="Site URL"
          value={general.siteUrl}
          placeholder="https://www.millimedbfs.com"
          onChange={(v) => setGeneral((s) => ({ ...s, siteUrl: v }))}
          full
        />
      </Card>

      <Card title="Homepage" onSave={() => saveHomepageSettings(homepage).then(() => {})}>
        <Field
          label="YouTube Embed URL"
          value={homepage.youtubeEmbedUrl}
          onChange={(v) => setHomepage({ youtubeEmbedUrl: v })}
          full
        />
      </Card>

      <Card title="Contact Info" onSave={() => saveContactInfo(contact).then(() => {})}>
        <Field label="Company Name TH" value={contact.companyNameTh} onChange={(v) => setContact((s) => ({ ...s, companyNameTh: v }))} />
        <Field label="Company Name EN" value={contact.companyNameEn} onChange={(v) => setContact((s) => ({ ...s, companyNameEn: v }))} />
        <Field label="Tax ID" value={contact.taxId} onChange={(v) => setContact((s) => ({ ...s, taxId: v }))} />
        <Field label="Phone" value={contact.phone} onChange={(v) => setContact((s) => ({ ...s, phone: v }))} />
        <TextAreaField label="Address TH" value={contact.addressTh} onChange={(v) => setContact((s) => ({ ...s, addressTh: v }))} />
        <TextAreaField label="Address EN" value={contact.addressEn} onChange={(v) => setContact((s) => ({ ...s, addressEn: v }))} />
        <Field label="Email" value={contact.email} onChange={(v) => setContact((s) => ({ ...s, email: v }))} />
        <Field label="Line ID" value={contact.lineId} onChange={(v) => setContact((s) => ({ ...s, lineId: v }))} />
        <Field
          label="Google Maps Embed URL"
          value={contact.googleMapsEmbedUrl}
          onChange={(v) => setContact((s) => ({ ...s, googleMapsEmbedUrl: v }))}
          full
        />
      </Card>

      <Card title="Branding" onSave={() => saveBrandingSettings(brand).then(() => {})}>
        <Field label="Tagline TH" value={brand.taglineTh} placeholder="ส่งต่อสุขภาพดี" onChange={(v) => setBrand((s) => ({ ...s, taglineTh: v }))} />
        <Field label="Tagline EN" value={brand.taglineEn} placeholder="Good Quality, Good Health" onChange={(v) => setBrand((s) => ({ ...s, taglineEn: v }))} />
      </Card>

      <Card title="Analytics & Pixels" onSave={() => saveAnalyticsSettings(analytics).then(() => {})}>
        <Field label="Google Tag Manager ID" value={analytics.gtmId} placeholder="GTM-XXXXXXX" onChange={(v) => setAnalytics((s) => ({ ...s, gtmId: v }))} />
        <Field label="GA4 Measurement ID" value={analytics.ga4Id} placeholder="G-XXXXXXXXXX" onChange={(v) => setAnalytics((s) => ({ ...s, ga4Id: v }))} />
        <Field label="Facebook Pixel ID" value={analytics.fbPixelId} onChange={(v) => setAnalytics((s) => ({ ...s, fbPixelId: v }))} />
        <Field label="TikTok Pixel ID" value={analytics.tiktokPixelId} onChange={(v) => setAnalytics((s) => ({ ...s, tiktokPixelId: v }))} />
      </Card>

      <Card title="SEO" onSave={() => saveSeoDefaults(seo).then(() => {})}>
        <Field label="Default Meta Title TH" value={seo.seoMetaTitleTh} onChange={(v) => setSeo((s) => ({ ...s, seoMetaTitleTh: v }))} full />
        <TextAreaField label="Default Meta Description TH" value={seo.seoMetaDescTh} onChange={(v) => setSeo((s) => ({ ...s, seoMetaDescTh: v }))} />
      </Card>

      <Card title="Social Media" onSave={() => saveSocialSettings(social).then(() => {})}>
        <Field label="Facebook URL" value={social.facebookUrl} onChange={(v) => setSocial((s) => ({ ...s, facebookUrl: v }))} />
        <Field label="Instagram URL" value={social.instagramUrl} onChange={(v) => setSocial((s) => ({ ...s, instagramUrl: v }))} />
        <Field label="YouTube URL" value={social.youtubeUrl} onChange={(v) => setSocial((s) => ({ ...s, youtubeUrl: v }))} />
        <Field label="TikTok URL" value={social.tiktokUrl} onChange={(v) => setSocial((s) => ({ ...s, tiktokUrl: v }))} />
        <Field label="LINE URL" value={social.lineUrl} onChange={(v) => setSocial((s) => ({ ...s, lineUrl: v }))} full />
        <div>
          <label className={labelClass}>รูปแบบไอคอน Social</label>
          <Select
            value={social.socialIconStyle}
            options={SOCIAL_ICON_STYLE_OPTIONS}
            onChange={(v) => setSocial((s) => ({ ...s, socialIconStyle: v }))}
          />
        </div>
        <div>
          <label className={labelClass}>แสดง Social Icons ใน Header</label>
          <Select
            value={social.showSocialInHeader ? "show" : "hide"}
            options={SHOW_HEADER_OPTIONS}
            onChange={(v) => setSocial((s) => ({ ...s, showSocialInHeader: v === "show" }))}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Site Assets</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <ImageUploader
              label="Site Logo"
              value={assets.siteLogoUrl}
              onChange={(v) => setAssets((s) => ({ ...s, siteLogoUrl: v }))}
            />
            <p className="text-xs text-slate-400">แนะนำ 400×200px อัตราส่วน 2:1</p>
          </div>
          <div className="flex flex-col gap-1">
            <ImageUploader
              label="Favicon"
              value={assets.faviconUrl}
              onChange={(v) => setAssets((s) => ({ ...s, faviconUrl: v }))}
            />
            <p className="text-xs text-slate-400">แนะนำ 64×64px พื้นหลังโปร่งใส สี่เหลี่ยมจัตุรัส</p>
          </div>
          <div className="flex flex-col gap-1">
            <ImageUploader
              label="รูปพื้นหลังหน้า Admin Login"
              value={assets.loginBgUrl}
              onChange={(v) => setAssets((s) => ({ ...s, loginBgUrl: v }))}
            />
            <p className="text-xs text-slate-400">แนะนำ 1200×900px ขึ้นไป</p>
          </div>
        </div>
        <div>
          <SaveButton onSave={() => saveSiteAssets(assets).then(() => {})} />
        </div>
      </div>
    </div>
  );
}
