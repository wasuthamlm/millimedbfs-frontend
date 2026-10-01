// SEO / AEO / GEO audit for CMS pages — the same checks and weights as the legacy
// site's src/lib/seoAudit.js (auditPage). Articles and products use
// lib/content-audit.ts (legacy ContentAuditPanel). Pure — safe on client and server.
//
// AEO/GEO have no public algorithm; these are content heuristics (answer-first
// paragraph, lists, question headings, depth, facts), so treat them as directional.

export type SeoCheck = { label: string; hint: string; passed: boolean; points: number; maxPoints: number };
export type SeoCategoryResult = { score: number; checks: SeoCheck[] };
export type SeoAeoGeoResult = {
  overall: number;
  seo: SeoCategoryResult;
  aeo: SeoCategoryResult;
  geo: SeoCategoryResult;
};

export type PageSeoAdapterInput = {
  titleTh: string;
  titleEn?: string | null;
  seoTitle?: string | null;
  seoTitleEn?: string | null;
  seoDesc?: string | null;
  seoDescEn?: string | null;
  slug: string;
  /** Block heading, rich-text body (HTML) and image of each page block. */
  sections: { titleTh: string; imageUrl?: string | null; bodyTh?: string | null }[];
};

const strip = (html: string | null | undefined) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function check(ok: boolean, weight: number, label: string, hint: string): SeoCheck {
  return { label, hint, passed: ok, points: ok ? weight : 0, maxPoints: weight };
}

function category(checks: SeoCheck[]): SeoCategoryResult {
  return { score: Math.min(100, checks.reduce((n, c) => n + c.points, 0)), checks };
}

/** Kept for call-site compatibility: the page fields are the audit input as-is. */
export function pageToScoreInput(page: PageSeoAdapterInput): PageSeoAdapterInput {
  return page;
}

export function calculateSeoAeoGeo(page: PageSeoAdapterInput): SeoAeoGeoResult {
  const sections = page.sections;
  const html = sections.map((s) => s.bodyTh || "").join("");
  const text = strip(html);
  const headings = `${sections.map((s) => s.titleTh || "").join(" ")} ${(html.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || []).map(strip).join(" ")}`;
  const title = (page.seoTitle || page.titleTh || "").trim();
  const desc = (page.seoDesc || "").trim();

  const seo = category([
    check(title.length >= 30 && title.length <= 60, 25, "Meta Title ยาว 30–60 ตัวอักษร", `ตอนนี้ ${title.length} ตัวอักษร`),
    check(desc.length >= 70 && desc.length <= 160, 20, "Meta Description ยาว 70–160 ตัวอักษร", `ตอนนี้ ${desc.length} ตัวอักษร`),
    check(/<h[23][\s>]/i.test(html), 15, "มีหัวข้อย่อย H2/H3 ในเนื้อหา", "ช่วยให้ Google เข้าใจโครงสร้างหน้า"),
    check(text.length >= 600, 25, "เนื้อหายาวพอ (600 ตัวอักษรขึ้นไป)", `ตอนนี้ ${text.length} ตัวอักษร`),
    check(/<a\s[^>]*href=/i.test(html), 15, "มีลิงก์เชื่อมไปหน้าอื่น", "เพิ่มลิงก์ภายในอย่างน้อย 1 จุด"),
  ]);

  const firstParaLen = strip((html.match(/<p[^>]*>(.*?)<\/p>/i) || [])[1]).length;
  const filled = sections.filter((s) => strip(s.bodyTh).length > 50).length;
  const aeo = category([
    check(firstParaLen >= 80 && firstParaLen <= 400, 30, "ย่อหน้าแรกตอบคำถามตรงประเด็น (80–400 ตัวอักษร)", "AI Overview มักดึงย่อหน้าแรกไปแสดง"),
    check(/<(ul|ol|table)[\s>]/i.test(html), 25, "มีรายการ (bullet) หรือ ตาราง", "เนื้อหาแบบลิสต์ถูกดึงไปตอบง่ายกว่า"),
    check(
      /(\?|ทำไม|อะไร|อย่างไร|ยังไง|ที่ไหน|เมื่อไหร่|กี่|ใคร|why|what|how|where|when|who)/i.test(headings),
      20,
      "มีหัวข้อในรูปแบบคำถาม",
      'เช่น "ทำไมต้อง..." "สมัครอย่างไร"',
    ),
    check(sections.length > 0 && filled / sections.length >= 0.6, 25, "บล็อกส่วนใหญ่มีเนื้อหาครบ", `มีเนื้อหา ${filled}/${sections.length} บล็อก — อย่าปล่อยบล็อกว่าง`),
  ]);

  const geo = category([
    check(!!desc, 20, "มีคำอธิบายหน้า (Meta Description)", "AI ใช้สรุปว่าหน้านี้เกี่ยวกับอะไร"),
    check(!!(page.seoTitleEn?.trim() || page.titleEn?.trim()), 15, "มีชื่อหน้าภาษาอังกฤษ", "ช่วยให้ AI ต่างประเทศเข้าใจแบรนด์"),
    check(text.length >= 1200, 25, "เนื้อหาเชิงลึกพอให้ AI อ้างอิง (1,200+ ตัวอักษร)", `ตอนนี้ ${text.length} ตัวอักษร`),
    check(/\d/.test(text), 20, "มีตัวเลข/ข้อมูลเชิงข้อเท็จจริง", "เช่น ปีก่อตั้ง จำนวน สถิติ"),
    check(sections.some((s) => !!s.imageUrl) || /<img\s/i.test(html), 20, "มีรูปภาพประกอบ", "เพิ่มความน่าเชื่อถือและ rich result"),
  ]);

  return { overall: Math.round((seo.score + aeo.score + geo.score) / 3), seo, aeo, geo };
}
