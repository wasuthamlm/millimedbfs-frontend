// SEO scoring inspired by RankMath's on-page checklist. AEO (Answer Engine
// Optimization) and GEO (Generative Engine Optimization) have no established
// public algorithm — these are heuristic approximations built from our own
// content fields (meta length, list/question patterns, content depth), not a
// calibrated third-party score. Treat AEO/GEO numbers as directional, not exact.

export type SeoCheck = { label: string; hint: string; passed: boolean; points: number; maxPoints: number };
export type SeoCategoryResult = { score: number; checks: SeoCheck[] };
export type SeoAeoGeoResult = {
  overall: number;
  seo: SeoCategoryResult;
  aeo: SeoCategoryResult;
  geo: SeoCategoryResult;
};

export type SeoScoreInput = {
  titleTh: string;
  titleEn?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoDesc?: string | null;
  seoDescEn?: string | null;
  /** URL slug or other short identifier (e.g. SKU) used for the conciseness check. */
  identifier: string;
  identifierLabel: string;
  /** Plain-text content used for length/structure heuristics (no HTML — checks are phrased accordingly). */
  bodyText: string;
  hasImage: boolean;
  /** Count of structural units (page sections, paragraphs) used as a content-depth proxy. */
  structureCount: number;
};

const BULLET_OR_STEPS_RE = /(^|\n)\s*([-•*]|\d+[.)])\s+\S/;
const QUESTION_RE = /(ทำไม|อย่างไร|ยังไง|คืออะไร|เพราะอะไร|ขั้นตอน|วิธี|\?)/;
const LINK_RE = /(https?:\/\/|www\.)\S+/i;

/** Partial-credit tiering: too short or too long both cost points, matching RankMath's range checks. */
function tier(value: number, min: number, max: number, weight: number): number {
  if (value <= 0) return 0;
  if (value < min) return Math.round(weight * 0.3);
  if (value <= max) return weight;
  if (value <= max * 1.4) return Math.round(weight * 0.6);
  return Math.round(weight * 0.3);
}

function toCheck(label: string, hint: string, points: number, maxPoints: number): SeoCheck {
  return { label, hint, points, maxPoints, passed: points >= maxPoints };
}

function category(checks: SeoCheck[]): SeoCategoryResult {
  const score = Math.max(0, Math.min(100, checks.reduce((sum, c) => sum + c.points, 0)));
  return { score, checks };
}

function scoreSeo(input: SeoScoreInput): SeoCategoryResult {
  const titleLen = (input.seoTitle || input.titleTh).trim().length;
  const descLen = (input.seoDesc ?? "").trim().length;
  const bodyLen = input.bodyText.replace(/\s+/g, "").length;
  const identifierLen = input.identifier.trim().length;

  return category([
    toCheck(
      "Meta Title ยาวเหมาะสม (30–60 ตัวอักษร)",
      `ตอนนี้ ${titleLen} ตัวอักษร`,
      tier(titleLen, 30, 60, 25),
      25,
    ),
    toCheck(
      "Meta Description ยาวเหมาะสม (70–160 ตัวอักษร)",
      `ตอนนี้ ${descLen} ตัวอักษร`,
      descLen === 0 ? 0 : tier(descLen, 70, 160, 25),
      25,
    ),
    toCheck(
      "เนื้อหายาวพอ (600 ตัวอักษรขึ้นไป)",
      `ตอนนี้ ${bodyLen} ตัวอักษร`,
      bodyLen === 0 ? 0 : tier(bodyLen, 600, 4000, 20),
      20,
    ),
    toCheck("มีรูปภาพประกอบ", "ช่วยเพิ่มอัตราคลิกจากผลการค้นหาและโซเชียล", input.hasImage ? 15 : 0, 15),
    toCheck(
      `${input.identifierLabel}กระชับ อ่านง่าย (≤75 ตัวอักษร)`,
      `ตอนนี้ ${identifierLen} ตัวอักษร`,
      identifierLen === 0 ? 0 : identifierLen <= 75 ? 15 : 5,
      15,
    ),
  ]);
}

function scoreAeo(input: SeoScoreInput): SeoCategoryResult {
  const answerLen = (input.seoDesc || input.bodyText).trim().length;
  const hasList = BULLET_OR_STEPS_RE.test(input.bodyText);
  const hasQuestionForm = QUESTION_RE.test(`${input.titleTh} ${input.bodyText}`);

  return category([
    toCheck(
      "ย่อหน้า/คำอธิบายตอบคำถามตรงประเด็น (80–400 ตัวอักษร)",
      `ตอนนี้ ${answerLen} ตัวอักษร`,
      answerLen === 0 ? 0 : tier(answerLen, 80, 400, 30),
      30,
    ),
    toCheck(
      "มีรายการ (bullet) หรือขั้นตอนในเนื้อหา",
      "ช่วยให้ AI ดึงคำตอบเป็นลิสต์ได้ง่ายขึ้น",
      hasList ? 25 : 0,
      25,
    ),
    toCheck(
      "มีคำหรือหัวข้อในรูปแบบคำถาม",
      'เช่น "ทำไมต้อง...", "วิธี...", "คืออะไร"',
      hasQuestionForm ? 20 : 0,
      20,
    ),
    toCheck(
      "เนื้อหามีความครบถ้วน ไม่ปล่อยว่าง",
      `พบ ${input.structureCount} ส่วน/ย่อหน้า`,
      input.structureCount >= 2 ? 25 : input.structureCount === 1 ? 10 : 0,
      25,
    ),
  ]);
}

function scoreGeo(input: SeoScoreInput): SeoCategoryResult {
  const descLen = (input.seoDesc ?? "").trim().length;
  const bodyLen = input.bodyText.replace(/\s+/g, "").length;
  const hasEnglish = Boolean(input.titleEn?.trim() || input.seoTitleEn?.trim() || input.seoDescEn?.trim());
  const hasLink = LINK_RE.test(input.bodyText);

  return category([
    toCheck("มีคำอธิบายหน้า (Meta Description) ชัดเจน", "ช่วยให้ AI เข้าใจบริบทของหน้านี้", descLen > 0 ? 25 : 0, 25),
    toCheck("มีชื่อเรื่อง/คำอธิบายภาษาอังกฤษ", "เพิ่มโอกาสถูกอ้างอิงจากแหล่งข้อมูลนานาชาติ", hasEnglish ? 25 : 0, 25),
    toCheck(
      "เนื้อหาเชิงลึกพอให้ AI อ้างอิง (1,200 ตัวอักษรขึ้นไป)",
      `ตอนนี้ ${bodyLen} ตัวอักษร`,
      bodyLen === 0 ? 0 : tier(bodyLen, 1200, 6000, 30),
      30,
    ),
    toCheck("มีลิงก์ (URL) อ้างอิงแหล่งข้อมูลในเนื้อหา", "ตรวจจากข้อความ http(s):// หรือ www. ในเนื้อหา", hasLink ? 20 : 0, 20),
  ]);
}

export function calculateSeoAeoGeo(input: SeoScoreInput): SeoAeoGeoResult {
  const seo = scoreSeo(input);
  const aeo = scoreAeo(input);
  const geo = scoreGeo(input);
  return { overall: Math.round((seo.score + aeo.score + geo.score) / 3), seo, aeo, geo };
}

// ───────────────────────── Content-type adapters ─────────────────────────

export type PageSeoAdapterInput = {
  titleTh: string;
  titleEn?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoDesc?: string | null;
  seoDescEn?: string | null;
  slug: string;
  sections: { titleTh: string; imageUrl?: string | null; bodyTh?: string | null }[];
};

export function pageToScoreInput(page: PageSeoAdapterInput): SeoScoreInput {
  const bodyText = page.sections
    .map((s) => [s.titleTh, s.bodyTh].filter(Boolean).join(" "))
    .join("\n\n");
  return {
    titleTh: page.titleTh,
    titleEn: page.titleEn,
    seoTitle: page.seoTitle,
    seoTitleEn: page.seoTitleEn,
    seoDesc: page.seoDesc,
    seoDescEn: page.seoDescEn,
    identifier: page.slug,
    identifierLabel: "Slug ",
    bodyText,
    hasImage: page.sections.some((s) => Boolean(s.imageUrl)),
    structureCount: page.sections.length,
  };
}

export type PostSeoAdapterInput = {
  titleTh: string;
  titleEn?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoDesc?: string | null;
  seoDescEn?: string | null;
  excerptTh?: string | null;
  bodyTh?: string | null;
  slug: string;
  hasCoverImage: boolean;
};

export function postToScoreInput(post: PostSeoAdapterInput): SeoScoreInput {
  const bodyText = post.bodyTh || post.excerptTh || "";
  return {
    titleTh: post.titleTh,
    titleEn: post.titleEn,
    seoTitle: post.seoTitle,
    seoTitleEn: post.seoTitleEn,
    seoDesc: post.seoDesc || post.excerptTh,
    seoDescEn: post.seoDescEn,
    identifier: post.slug,
    identifierLabel: "Slug ",
    bodyText,
    hasImage: post.hasCoverImage,
    structureCount: bodyText.split(/\n{2,}/).filter((p) => p.trim().length > 0).length,
  };
}

export type ProductSeoAdapterInput = {
  nameTh: string;
  nameEn?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoDesc?: string | null;
  seoDescEn?: string | null;
  descriptionTh?: string | null;
  sku: string;
  hasImage: boolean;
};

export function productToScoreInput(product: ProductSeoAdapterInput): SeoScoreInput {
  const bodyText = product.descriptionTh || "";
  return {
    titleTh: product.nameTh,
    titleEn: product.nameEn,
    seoTitle: product.seoTitle,
    seoTitleEn: product.seoTitleEn,
    seoDesc: product.seoDesc || product.descriptionTh,
    seoDescEn: product.seoDescEn,
    identifier: product.sku,
    identifierLabel: "SKU ",
    bodyText,
    hasImage: product.hasImage,
    structureCount: bodyText.split(/\n{2,}/).filter((p) => p.trim().length > 0).length,
  };
}
