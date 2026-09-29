// Live SEO / AEO-GEO / performance audit for the article and product forms,
// ported from the legacy site's ContentAuditPanel (computeContentAudit).
// Criteria follow Google Search Essentials, the SEO Starter Guide, Featured
// Snippets / AI Overviews guidance and Core Web Vitals. Pure — safe on client.

export type AuditIssue = { cat: "SEO" | "AEO" | "GEO" | "Perf"; level: "error" | "warn" | "info"; text: string };
export type ContentAudit = { seo: number; aeo: number; perf: number; overall: number; issues: AuditIssue[] };

const stripTags = (html: string) => html.replace(/<[^>]+>/g, "").trim();

export function computeContentAudit({
  title,
  metaTitle,
  metaDesc,
  focusKeyword,
  bodyHtml,
  images = [],
  faq = null,
  shortDesc = null,
}: {
  title: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
  focusKeyword?: string | null;
  bodyHtml?: string | null;
  images?: (string | null | undefined)[];
  /** Pass the FAQ list for articles; null for products (short description is used instead). */
  faq?: unknown[] | null;
  shortDesc?: string | null;
}): ContentAudit {
  const issues: AuditIssue[] = [];
  const html = bodyHtml || "";
  const text = stripTags(html);
  const textLen = text.length;
  const imgs = images.filter((u): u is string => !!u);

  // ════ SEO (100) ════
  let seo = 0;
  const mt = metaTitle || title || "";
  if (!mt) {
    issues.push({ cat: "SEO", level: "error", text: "ไม่มี Meta Title — Google จะสร้างหัวข้อให้เองซึ่งอาจไม่ตรง Keyword" });
  } else if (mt.length < 30 || mt.length > 60) {
    seo += 15;
    issues.push({ cat: "SEO", level: "warn", text: `Meta Title ${mt.length} ตัวอักษร — Google แสดง ~50–60 ตัวอักษรก่อนตัด (ควร 30–60)` });
  } else seo += 25;

  const descLen = (metaDesc || "").length;
  if (descLen === 0) {
    issues.push({ cat: "SEO", level: "error", text: "ไม่มี Meta Description — Google จะดึงข้อความจากหน้าแทน ทำให้ CTR ต่ำลง" });
  } else if (descLen < 70 || descLen > 160) {
    seo += 8;
    issues.push({ cat: "SEO", level: "warn", text: `Meta Description ${descLen} ตัวอักษร (ควร 70–160)` });
  } else seo += 15;

  if (focusKeyword) {
    if (mt.includes(focusKeyword) || text.includes(focusKeyword)) seo += 15;
    else {
      seo += 8;
      issues.push({ cat: "SEO", level: "warn", text: "Focus Keyword ไม่ปรากฏใน Title หรือเนื้อหา" });
    }
    const occurrences = text.split(focusKeyword).length - 1;
    const density = textLen ? (occurrences * focusKeyword.length * 100) / textLen : 0;
    if (textLen > 300 && density > 3) {
      issues.push({ cat: "SEO", level: "warn", text: `Focus Keyword ถี่เกินไป (${density.toFixed(1)}%) — เสี่ยงถูกมองว่า keyword stuffing` });
    }
  } else {
    issues.push({ cat: "SEO", level: "info", text: "ยังไม่กำหนด Focus Keyword — ช่วยให้เนื้อหาโฟกัสคำค้นเป้าหมาย" });
  }

  if (/<h[23][\s>]/i.test(html)) seo += 15;
  else if (textLen > 0) issues.push({ cat: "SEO", level: "warn", text: "ไม่มีหัวข้อ H2/H3 ในเนื้อหา — Google ใช้ heading เข้าใจโครงสร้าง" });

  if (textLen >= 1500) seo += 20;
  else if (textLen >= 600) seo += 15;
  else if (textLen >= 300) {
    seo += 8;
    issues.push({ cat: "SEO", level: "info", text: `เนื้อหา ~${textLen} ตัวอักษร — เนื้อหาที่ครอบคลุม (600+) จัดอันดับได้ดีกว่า` });
  } else {
    issues.push({ cat: "SEO", level: "warn", text: "เนื้อหาบางเกินไป (Thin Content) — Google ให้คุณค่ากับเนื้อหาที่ตอบโจทย์ครบ" });
  }

  if (imgs.length > 0) seo += 10;
  else issues.push({ cat: "SEO", level: "info", text: "ยังไม่มีรูปภาพ — รูปช่วยทั้ง SEO และประสบการณ์ผู้อ่าน" });

  // ════ AEO / GEO (100) ════
  let aeo = 0;
  const firstP = (html.match(/<p[^>]*>(.*?)<\/p>/i) || [])[1] ?? "";
  const firstPLen = stripTags(firstP).length;
  if ((firstPLen >= 80 && firstPLen <= 400) || (shortDesc || "").length >= 60) aeo += 30;
  else if (textLen > 0 || shortDesc !== null) {
    issues.push({ cat: "AEO", level: "warn", text: "เริ่มเนื้อหาด้วยย่อหน้าสรุปสั้นๆ (2–3 ประโยค) — รูปแบบที่ AI Overviews ดึงไปตอบ" });
  }

  if (/<(ul|ol|table)[\s>]/i.test(html)) aeo += 25;
  else if (textLen > 0) issues.push({ cat: "AEO", level: "warn", text: "เพิ่ม Bullet List หรือตาราง — Featured Snippet ดึง list/table ไปแสดงบ่อยที่สุด" });

  const headingsText = (html.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || []).map(stripTags).join(" ");
  if (/(\?|ทำไม|อะไร|อย่างไร|ยังไง|ที่ไหน|เมื่อไหร่|กี่|ใคร)/.test(headingsText)) aeo += 20;
  else if (textLen > 0) issues.push({ cat: "GEO", level: "info", text: 'ตั้งหัวข้อเป็นรูปแบบคำถาม เช่น "ทำไมต้อง..." — ตรงกับคำค้นใน AI Search' });

  if (faq !== null) {
    if (faq.length > 0) aeo += 25;
    else issues.push({ cat: "AEO", level: "warn", text: "ยังไม่มี FAQ — FAQ Schema คือแหล่งคำตอบหลักของ AI Search" });
  } else if ((shortDesc || "").trim()) aeo += 25;
  else issues.push({ cat: "AEO", level: "warn", text: "ยังไม่มีคำโปรยสั้น (Short Description) — ใช้เป็นคำตอบสรุปให้ AI Search" });

  // ════ Perf (100) ════
  let perf = 0;
  if (imgs.length === 0) perf += 35;
  else {
    const webp = imgs.filter((u) => u.toLowerCase().includes(".webp")).length;
    perf += 20 + Math.round((webp / imgs.length) * 30);
    if (webp < imgs.length) issues.push({ cat: "Perf", level: "warn", text: "บางภาพไม่เป็น .webp — กระทบ LCP (Core Web Vitals)" });
  }
  const imgInBody = (html.match(/<img\s/gi) || []).length;
  if (imgs.length + imgInBody <= 10) perf += 25;
  else {
    perf += 10;
    issues.push({ cat: "Perf", level: "warn", text: `มีรูป ${imgs.length + imgInBody} รูป — หน้าหนักเกินไป กระทบเวลาโหลด` });
  }
  if (html.length <= 50000) perf += 25;
  else {
    perf += 10;
    issues.push({ cat: "Perf", level: "warn", text: "เนื้อหา HTML ใหญ่มาก — กระทบเวลาเรนเดอร์" });
  }

  seo = Math.min(100, seo);
  aeo = Math.min(100, aeo);
  perf = Math.min(100, perf);
  return { seo, aeo, perf, overall: Math.round(seo * 0.35 + aeo * 0.35 + perf * 0.3), issues };
}
