export type SectionType = "hero-banners" | "cta-bar" | "company-intro" | "latest-news" | "articles";

export type DeviceVisibility = {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
};

export type PageSection = {
  id: string;
  order: number;
  type: SectionType;
  titleTh: string;
  titleEn: string;
  sourceLabel: string;
  visibility: DeviceVisibility;
  columns?: number;
  itemsToShow?: number;
  matchedCount?: number;
  anchorId?: string;
  bodyTh?: string;
  imageUrl?: string;
};

// Seed data for the "home" page — the only page-builder page today.
export const homeSections: PageSection[] = [
  {
    id: "sec1",
    order: 1,
    type: "hero-banners",
    titleTh: "Hero Banners (สไลด์หน้าแรก)",
    titleEn: "Hero Banners",
    sourceLabel: "Banners (เมนู Banners)",
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: "sec2",
    order: 2,
    type: "cta-bar",
    titleTh: "แถบ CTA (สมัคร/เข้าสู่ระบบ)",
    titleEn: "CTA Bar",
    sourceLabel: "Settings → Tagline + Biz URL",
    visibility: { desktop: true, tablet: true, mobile: true },
  },
  {
    id: "sec3",
    order: 3,
    type: "company-intro",
    titleTh: "ส่วนแนะนำบริษัท",
    titleEn: "Company Intro",
    sourceLabel: "Page Sections (หน้านี้)",
    visibility: { desktop: true, tablet: true, mobile: false },
    columns: 1,
  },
  {
    id: "sec4",
    order: 4,
    type: "latest-news",
    titleTh: "ข่าวสารล่าสุด",
    titleEn: "Latest News",
    sourceLabel: "Articles ที่ published",
    visibility: { desktop: true, tablet: true, mobile: true },
    itemsToShow: 3,
    matchedCount: 12,
  },
  {
    id: "sec5",
    order: 5,
    type: "articles",
    titleTh: "บทความน่ารู้",
    titleEn: "Health Article",
    sourceLabel: "Articles (บทความ)",
    visibility: { desktop: true, tablet: true, mobile: true },
    columns: 4,
    itemsToShow: 8,
    matchedCount: 36,
  },
];
