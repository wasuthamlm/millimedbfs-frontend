// SEO scoring inspired by RankMath's on-page checklist (title/meta length,
// content length, media, categorisation, slug quality, etc). RankMath itself
// is a WordPress plugin with no public API, so this re-implements its core
// checks against our own Post fields rather than calling RankMath directly.

export type SeoCheckInput = {
  titleTh: string;
  titleEn?: string | null;
  excerptTh?: string | null;
  bodyTh?: string | null;
  slug: string;
  category?: string | null;
  hasCoverImage: boolean;
};

export type SeoCheck = { label: string; points: number; maxPoints: number };
export type SeoScoreResult = { score: number; checks: SeoCheck[] };

/** Partial-credit scoring: too short or too long both cost points, matching RankMath's range checks. */
function tier(value: number, min: number, max: number, weight: number) {
  if (value <= 0) return 0;
  if (value < min) return Math.round(weight * 0.3);
  if (value <= max) return weight;
  if (value <= max * 1.4) return Math.round(weight * 0.6);
  return Math.round(weight * 0.3);
}

export function calculateSeoScore(post: SeoCheckInput): SeoScoreResult {
  const titleLen = post.titleTh.trim().length;
  const excerptLen = (post.excerptTh ?? "").trim().length;
  const bodyLen = (post.bodyTh ?? "").replace(/\s+/g, "").length;
  const slugLen = post.slug.trim().length;

  const checks: SeoCheck[] = [
    {
      label: "ความยาวชื่อเรื่อง (40–60 ตัวอักษร)",
      points: tier(titleLen, 20, 60, 15),
      maxPoints: 15,
    },
    {
      label: "มี Meta description และความยาวเหมาะสม (120–160 ตัวอักษร)",
      points: excerptLen === 0 ? 0 : tier(excerptLen, 60, 160, 15),
      maxPoints: 15,
    },
    {
      label: "ความยาวเนื้อหาบทความ (≥600 ตัวอักษร)",
      points: bodyLen === 0 ? 0 : tier(bodyLen, 300, 4000, 20),
      maxPoints: 20,
    },
    {
      label: "มีรูปปก (cover image)",
      points: post.hasCoverImage ? 10 : 0,
      maxPoints: 10,
    },
    {
      label: "กำหนดหมวดหมู่ (category)",
      points: post.category ? 10 : 0,
      maxPoints: 10,
    },
    {
      label: "Slug กระชับ อ่านง่าย (≤75 ตัวอักษร)",
      points: slugLen === 0 ? 0 : slugLen <= 75 ? 10 : 5,
      maxPoints: 10,
    },
    {
      label: "ชื่อเรื่องกับ Meta description ไม่ซ้ำกัน",
      points:
        post.titleTh.trim() && post.excerptTh?.trim() && post.titleTh.trim() !== post.excerptTh.trim()
          ? 10
          : 0,
      maxPoints: 10,
    },
    {
      label: "มีชื่อเรื่องภาษาอังกฤษ (bilingual SEO)",
      points: post.titleEn?.trim() ? 10 : 0,
      maxPoints: 10,
    },
  ];

  const score = checks.reduce((sum, c) => sum + c.points, 0);
  return { score: Math.max(0, Math.min(100, score)), checks };
}

export type PageSeoCheckInput = {
  titleTh: string;
  titleEn?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  slug: string;
  sectionsCount: number;
};

export function calculatePageSeoScore(page: PageSeoCheckInput): SeoScoreResult {
  const seoTitleLen = (page.seoTitle ?? "").trim().length;
  const seoDescLen = (page.seoDesc ?? "").trim().length;
  const slugLen = page.slug.trim().length;

  const checks: SeoCheck[] = [
    {
      label: "มี Meta title และความยาวเหมาะสม (40–60 ตัวอักษร)",
      points: seoTitleLen === 0 ? 0 : tier(seoTitleLen, 20, 60, 25),
      maxPoints: 25,
    },
    {
      label: "มี Meta description และความยาวเหมาะสม (120–160 ตัวอักษร)",
      points: seoDescLen === 0 ? 0 : tier(seoDescLen, 60, 160, 25),
      maxPoints: 25,
    },
    {
      label: "มีเนื้อหา/เซกชันในหน้า",
      points: page.sectionsCount > 0 ? 20 : 0,
      maxPoints: 20,
    },
    {
      label: "Slug กระชับ อ่านง่าย (≤75 ตัวอักษร)",
      points: slugLen === 0 ? 0 : slugLen <= 75 ? 15 : 8,
      maxPoints: 15,
    },
    {
      label: "มีชื่อเรื่องภาษาอังกฤษ (bilingual SEO)",
      points: page.titleEn?.trim() ? 15 : 0,
      maxPoints: 15,
    },
  ];

  const score = checks.reduce((sum, c) => sum + c.points, 0);
  return { score: Math.max(0, Math.min(100, score)), checks };
}
