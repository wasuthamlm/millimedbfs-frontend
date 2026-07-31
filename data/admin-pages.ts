export type PageStatus = "published" | "draft";

export type AdminPage = {
  id: string;
  titleTh: string;
  titleEn: string;
  slug: string;
  status: PageStatus;
  seo: number;
  sectionsCount: number;
};

export const adminPages: AdminPage[] = [
  { id: "pg1", titleTh: "หน้าแรก", titleEn: "Home", slug: "home", status: "published", seo: 34, sectionsCount: 5 },
  { id: "pg2", titleTh: "เกี่ยวกับ", titleEn: "About", slug: "about", status: "published", seo: 31, sectionsCount: 5 },
  { id: "pg3", titleTh: "ติดต่อ", titleEn: "Contact", slug: "contact", status: "published", seo: 31, sectionsCount: 1 },
  { id: "pg4", titleTh: "บทความ", titleEn: "Article", slug: "article", status: "published", seo: 31, sectionsCount: 0 },
  { id: "pg5", titleTh: "อาคาร BFS", titleEn: "BFS Building", slug: "bfs", status: "published", seo: 44, sectionsCount: 0 },
  {
    id: "pg6",
    titleTh: "อาคาร CENTER LAB BUILDING",
    titleEn: "Tablet Building",
    slug: "center_lab_building",
    status: "published",
    seo: 55,
    sectionsCount: 0,
  },
  {
    id: "pg7",
    titleTh: "อาคาร OSD BUILDING",
    titleEn: "R&D Building",
    slug: "OSD_building",
    status: "published",
    seo: 55,
    sectionsCount: 0,
  },
  {
    id: "pg8",
    titleTh: "อาคาร Automated Warehouse",
    titleEn: "Automated Warehouse",
    slug: "automated_warehouse",
    status: "published",
    seo: 55,
    sectionsCount: 0,
  },
  { id: "pg9", titleTh: "มาตรฐานผู้ผลิต", titleEn: "Standards", slug: "standards", status: "published", seo: 28, sectionsCount: 0 },
  { id: "pg10", titleTh: "สินค้า", titleEn: "Products", slug: "products", status: "published", seo: 33, sectionsCount: 0 },
  { id: "pg11", titleTh: "ข่าวสาร", titleEn: "News", slug: "news", status: "published", seo: 29, sectionsCount: 0 },
  { id: "pg12", titleTh: "โปรโมชั่นฤดูร้อน", titleEn: "Summer Promotion", slug: "summer-promo", status: "draft", seo: 12, sectionsCount: 0 },
];

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
};

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

export const pageSectionsBySlug: Record<string, PageSection[]> = {
  home: homeSections,
};
