import type { SectionType as DbSectionType } from "@/lib/generated/prisma/client";

/**
 * Page-builder block model shared by the admin editor, the save action and
 * the public renderer (ported from the legacy CustomSections / sectionFields /
 * sectionLayout). Anything type-specific lives in `config` (PageSection.config JSON).
 */

export type SectionType =
  | "hero-banners"
  | "cta-bar"
  | "company-intro"
  | "latest-news"
  | "articles"
  | "text"
  | "columns"
  | "text-image"
  | "video"
  | "gallery"
  | "cta"
  | "layout"
  | "data-products"
  | "data-articles"
  | "download"
  | "contact-info"
  | "about-teaser"
  | "youtube";

export const TYPE_TO_DB: Record<SectionType, DbSectionType> = {
  "hero-banners": "HERO_BANNERS",
  "cta-bar": "CTA_BAR",
  "company-intro": "COMPANY_INTRO",
  "latest-news": "LATEST_NEWS",
  articles: "ARTICLES",
  text: "TEXT",
  columns: "COLUMNS",
  "text-image": "TEXT_IMAGE",
  video: "VIDEO",
  gallery: "GALLERY",
  cta: "CTA",
  layout: "LAYOUT",
  "data-products": "DATA_PRODUCTS",
  "data-articles": "DATA_ARTICLES",
  download: "DOWNLOAD",
  "contact-info": "CONTACT_INFO",
  "about-teaser": "ABOUT_TEASER",
  youtube: "YOUTUBE",
};

export const TYPE_FROM_DB = Object.fromEntries(Object.entries(TYPE_TO_DB).map(([k, v]) => [v, k])) as Record<DbSectionType, SectionType>;
// CUSTOM was the old free-form block — edit it as a text block.
TYPE_FROM_DB.CUSTOM = "company-intro";

export type DeviceVisibility = { desktop: boolean; tablet: boolean; mobile: boolean };

export type SectionBackground = {
  type: "none" | "color" | "image";
  color?: string;
  imageUrl?: string;
  /** Overlay darkness over the image, 0–80 */
  overlay?: number;
  textColor?: "dark" | "light";
};

export type SectionSpacing = {
  paddingY?: "none" | "sm" | "md" | "lg" | "xl";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  textAlign?: "left" | "center" | "right";
};

export type CtaButtons = {
  primaryLabelTh?: string;
  primaryLabelEn?: string;
  primaryUrl?: string;
  secondaryLabelTh?: string;
  secondaryLabelEn?: string;
  secondaryUrl?: string;
  newTab?: boolean;
};

export type LayoutColumn = {
  kind: "text" | "image" | "video" | "cta";
  /** Relative width (flex-grow), 1–4 */
  width: number;
  bodyTh?: string;
  bodyEn?: string;
  imageUrl?: string;
  videoUrl?: string;
  cta?: CtaButtons;
};

export type AboutCard = { titleTh: string; titleEn?: string; bodyTh: string; bodyEn?: string; imageUrl?: string; href?: string };

export type SectionConfig = {
  anchorId?: string;
  bodyTh?: string;
  bodyEn?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right" | "top";
  background?: SectionBackground;
  spacing?: SectionSpacing;
  videoUrl?: string;
  /** Video width as % of the content box */
  videoWidth?: number;
  galleryUrls?: string[];
  fileUrl?: string;
  fileLabelTh?: string;
  fileLabelEn?: string;
  cta?: CtaButtons;
  layoutColumns?: LayoutColumn[];
  layoutGap?: "sm" | "md" | "lg";
  layoutAlign?: "start" | "center" | "end";
  stackOnMobile?: boolean;
  /** DATA_PRODUCTS */
  productCategoryId?: string;
  productSort?: "newest" | "name" | "price-asc" | "price-desc" | "manual";
  productIds?: string[];
  /** DATA_ARTICLES / ARTICLES / LATEST_NEWS: limit to one article type */
  articleTypeId?: string;
  /** ABOUT_TEASER */
  cards?: AboutCard[];
};

export type PageSection = {
  id: string;
  order: number;
  type: SectionType;
  titleTh: string;
  titleEn: string;
  /** Admin-only block name */
  customLabel?: string;
  sourceLabel: string;
  visibility: DeviceVisibility;
  columns?: number;
  itemsToShow?: number;
  matchedCount?: number;
  config: SectionConfig;
};

type BlockMeta = { label: string; description: string; sourceLabel: string; defaults: Partial<PageSection> };

/** Everything the "add block" menu offers, in menu order. */
export const BLOCK_TYPES: Record<SectionType, BlockMeta> = {
  text: { label: "ข้อความ", description: "หัวข้อ + เนื้อหา rich text", sourceLabel: "เขียนเนื้อหาเอง", defaults: {} },
  "text-image": {
    label: "ข้อความ + รูป",
    description: "รูปด้านซ้าย/ขวาของข้อความ",
    sourceLabel: "เขียนเนื้อหาเอง",
    defaults: { config: { imagePosition: "left" } },
  },
  columns: { label: "ข้อความหลายคอลัมน์", description: "เนื้อหาแบ่ง 2–3 คอลัมน์", sourceLabel: "เขียนเนื้อหาเอง", defaults: { columns: 2 } },
  layout: {
    label: "Layout หลายคอลัมน์",
    description: "คอลัมน์ข้อความ/รูป/วิดีโอ/ปุ่ม กำหนดความกว้างเองได้",
    sourceLabel: "เขียนเนื้อหาเอง",
    defaults: {
      config: {
        layoutColumns: [
          { kind: "text", width: 1, bodyTh: "" },
          { kind: "image", width: 1, imageUrl: "" },
        ],
        stackOnMobile: true,
        layoutGap: "md",
        layoutAlign: "center",
      },
    },
  },
  video: { label: "วิดีโอ", description: "YouTube / Vimeo / ไฟล์ MP4", sourceLabel: "ลิงก์วิดีโอ", defaults: { config: { videoWidth: 100 } } },
  youtube: { label: "YouTube (หน้าแรก)", description: "วิดีโอจาก Settings → YouTube", sourceLabel: "Settings → YouTube URL", defaults: {} },
  gallery: { label: "แกลเลอรีรูป", description: "ตารางรูปภาพ", sourceLabel: "คลังสื่อ", defaults: { columns: 3, config: { galleryUrls: [] } } },
  cta: {
    label: "CTA / ปุ่ม",
    description: "หัวข้อ ข้อความ และปุ่ม 1–2 ปุ่ม",
    sourceLabel: "เขียนเนื้อหาเอง",
    defaults: { config: { cta: { primaryLabelTh: "ติดต่อเรา", primaryUrl: "/contact" }, spacing: { textAlign: "center" } } },
  },
  "data-products": {
    label: "รายการสินค้า",
    description: "ดึงสินค้าจากหมวดหมู่ หรือเลือกเอง",
    sourceLabel: "สินค้า",
    defaults: { columns: 4, itemsToShow: 8, config: { productSort: "newest" } },
  },
  "data-articles": {
    label: "รายการบทความตามประเภท",
    description: "ดึงบทความจากประเภทที่เลือก",
    sourceLabel: "บทความ",
    defaults: { columns: 3, itemsToShow: 6 },
  },
  "latest-news": { label: "ข่าวสารล่าสุด", description: "ข่าวที่เผยแพร่ล่าสุด", sourceLabel: "Articles ที่ published", defaults: { itemsToShow: 3 } },
  articles: { label: "บทความน่ารู้", description: "การ์ดบทความ", sourceLabel: "Articles (บทความ)", defaults: { columns: 4, itemsToShow: 8 } },
  "hero-banners": { label: "Hero Banners", description: "สไลด์จากเมนู Banners", sourceLabel: "Banners (เมนู Banners)", defaults: {} },
  download: { label: "ดาวน์โหลดไฟล์", description: "ปุ่มดาวน์โหลด PDF", sourceLabel: "คลังสื่อ", defaults: { config: { fileLabelTh: "ดาวน์โหลด" } } },
  "contact-info": { label: "ข้อมูลติดต่อ", description: "ที่อยู่ โทร อีเมล แผนที่ จาก Settings", sourceLabel: "Settings → ข้อมูลติดต่อ", defaults: {} },
  "about-teaser": {
    label: "การ์ดแนะนำ",
    description: "การ์ดรูป + ข้อความหลายใบ",
    sourceLabel: "เขียนเนื้อหาเอง",
    defaults: { columns: 3, config: { cards: [{ titleTh: "", bodyTh: "" }] } },
  },
  "company-intro": { label: "ข้อความ + รูป (แบบเดิม)", description: "บล็อกเนื้อหาแบบเดิม", sourceLabel: "เขียนเนื้อหาเอง", defaults: {} },
  "cta-bar": { label: "แถบ CTA (เลิกใช้)", description: "ไม่แสดงผลแล้ว", sourceLabel: "—", defaults: {} },
};

export function newSection(type: SectionType): PageSection {
  const meta = BLOCK_TYPES[type];
  return {
    id: crypto.randomUUID(),
    order: 0,
    type,
    titleTh: "",
    titleEn: "",
    customLabel: "",
    sourceLabel: meta.sourceLabel,
    visibility: { desktop: true, tablet: true, mobile: true },
    ...meta.defaults,
    config: { ...(meta.defaults.config ?? {}) },
  };
}

/** Normalises a stored config JSON (older rows kept bodyTh/imageUrl at the top level, which is still the shape). */
export function parseConfig(value: unknown): SectionConfig {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as SectionConfig) : {};
}
