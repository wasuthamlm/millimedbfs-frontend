"use server";

import { z } from "zod";
import { requireAdmin, requirePermission } from "@/lib/require-admin";
import { generateJson } from "@/lib/ai";
import { translateFields } from "@/lib/translate";
import { logActivity } from "@/lib/activity-log";

// Admin-side AI helpers (ported from the legacy site's generateArticle function
// and the InvokeLLM calls in AIArticleWriter, AiFaqGenerator, SeoFields,
// SeoDefaultsAiSuggest, PageSeoAiSuggest and ImageUploaderWithMeta).

type AiResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

async function run<T>(fn: () => Promise<T>): Promise<AiResult<T>> {
  try {
    return { data: await fn() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI ทำงานไม่สำเร็จ กรุณาลองใหม่" };
  }
}

const stripHtml = (html: string, max = 12000) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

// ───────────────────────── Article writer ─────────────────────────

const ARTICLE_SYSTEM = `You are a Thai SEO, AEO, and GEO expert writing content for the Millimed BFS website (a Thai pharmaceutical and eye-care manufacturer).
Write 100% in Thai. Follow this structure exactly:
1. H1 title (contains the primary keyword naturally)
2. Introduction paragraph (2-3 sentences — a direct answer to the main question, optimized for AI Overview snippets) inside <div class="article-intro">
3. 3-5 H2 sections with 2-3 paragraphs each (use H3 sub-points where appropriate)
4. FAQ section inside <div class="faq-section">: exactly 7 Q&A pairs (questions match how Thai users actually search; answers are 2-4 sentences, direct and factual)
5. Conclusion with a soft CTA
bodyTh is full HTML using h1, h2, h3, p, ul/li tags. Do not make medical claims that are not generally accepted; avoid promising cures.
excerptTh: plain text, max 160 characters. seoTitle: max 60 characters. seoDesc: max 155 characters and contains the primary keyword.
slug: lowercase English words joined by hyphens (a-z, 0-9, -), max 80 characters.`;

const articleSchema = z.object({
  titleTh: z.string(),
  bodyTh: z.string(),
  excerptTh: z.string(),
  seoTitle: z.string(),
  seoDesc: z.string(),
  slug: z.string(),
  focusKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
  faq: z.array(z.object({ qTh: z.string(), aTh: z.string() })),
  schemaArticle: z.object({ headline: z.string(), description: z.string(), keywords: z.array(z.string()) }),
});
export type GeneratedArticle = z.infer<typeof articleSchema>;

export async function aiGenerateArticle(input: {
  topic: string;
  focusKeyword?: string;
  audience?: string;
  tone?: string;
  notes?: string;
}): Promise<AiResult<GeneratedArticle>> {
  const session = await requirePermission("article.create");
  if (!input.topic.trim()) return { error: "กรุณาระบุหัวข้อบทความ" };
  const result = await run(() =>
    generateJson(articleSchema, {
      system: ARTICLE_SYSTEM,
      user: [
        `หัวข้อ: ${input.topic}`,
        input.focusKeyword && `คีย์เวิร์ดหลัก: ${input.focusKeyword}`,
        input.audience && `กลุ่มเป้าหมาย: ${input.audience}`,
        input.tone && `น้ำเสียง: ${input.tone}`,
        input.notes && `ข้อมูลเพิ่มเติม: ${input.notes}`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  );
  if (result.data) {
    await logActivity(session.user, "create", "Post", { targetLabel: result.data.titleTh, details: "สร้างร่างบทความด้วย AI" });
  }
  return result;
}

// ───────────────────────── FAQ generator ─────────────────────────

const faqSchema = z.object({ faq: z.array(z.object({ qTh: z.string(), aTh: z.string(), qEn: z.string(), aEn: z.string() })) });
export type FaqItem = z.infer<typeof faqSchema>["faq"][number];

export async function aiGenerateFaq(input: { title: string; body: string; count?: number }): Promise<AiResult<FaqItem[]>> {
  await requireAdmin();
  const count = Math.min(Math.max(input.count ?? 7, 3), 12);
  const result = await run(() =>
    generateJson(faqSchema, {
      system: `You write FAQ sections for a Thai pharmaceutical company website, optimised for AEO/GEO (answer engines).
Write exactly ${count} question/answer pairs based ONLY on the given content. Questions should match how Thai users search.
Answers: 2-4 sentences, direct and factual. Provide Thai (qTh/aTh) and a natural English translation (qEn/aEn).`,
      user: `หัวข้อ: ${input.title}\n\nเนื้อหา:\n${stripHtml(input.body)}`,
    }),
  );
  return result.data ? { data: result.data.faq } : { error: result.error! };
}

// ───────────────────────── SEO suggestions ─────────────────────────

const seoSchema = z.object({
  seoTitle: z.string(),
  seoDesc: z.string(),
  seoTitleEn: z.string(),
  seoDescEn: z.string(),
  focusKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
});
export type SeoSuggestion = z.infer<typeof seoSchema>;

export async function aiSuggestSeo(input: { title: string; body: string; focusKeyword?: string }): Promise<AiResult<SeoSuggestion>> {
  await requireAdmin();
  return run(() =>
    generateJson(seoSchema, {
      system: `You are an SEO specialist for a Thai pharmaceutical company. Suggest search metadata for the given page.
seoTitle (Thai) and seoTitleEn: at most 60 characters, include the focus keyword naturally.
seoDesc (Thai) and seoDescEn: at most 155 characters, compelling, include the focus keyword.
focusKeyword: the single best Thai search phrase. secondaryKeywords: 3-5 related Thai phrases.`,
      user: [
        `หัวข้อ: ${input.title}`,
        input.focusKeyword && `คีย์เวิร์ดที่ต้องการ: ${input.focusKeyword}`,
        `เนื้อหา:\n${stripHtml(input.body, 6000)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  );
}

const seoDefaultsSchema = z.object({ seoMetaTitleTh: z.string(), seoMetaDescTh: z.string() });

export async function aiSuggestSeoDefaults(input: { siteName: string; about: string }): Promise<AiResult<z.infer<typeof seoDefaultsSchema>>> {
  await requirePermission("settings.edit");
  return run(() =>
    generateJson(seoDefaultsSchema, {
      system: `Suggest the site-wide default Thai meta title (max 60 characters) and meta description (max 155 characters) for a company website.`,
      user: `ชื่อเว็บไซต์: ${input.siteName}\nเกี่ยวกับบริษัท: ${input.about}`,
    }),
  );
}

// ───────────────────────── Alt text ─────────────────────────

const altSchema = z.object({ altTh: z.string(), altEn: z.string() });

export async function aiSuggestAltText(input: { imageUrl: string; context?: string }): Promise<AiResult<z.infer<typeof altSchema>>> {
  await requireAdmin();
  if (!/^https:\/\//.test(input.imageUrl)) return { error: "ต้องเป็น URL รูปภาพแบบ https" };
  return run(() =>
    generateJson(altSchema, {
      system: `Write concise, descriptive image alt text for accessibility and SEO: Thai (altTh) and English (altEn), each at most 125 characters. Describe what is visible; do not start with "image of".`,
      user: input.context ? `บริบทของหน้า: ${input.context}` : "อธิบายรูปนี้",
      imageUrl: input.imageUrl,
    }),
  );
}

// ───────────────────────── Per-form translation (LocaleTabs) ─────────────────────────

export async function aiTranslateFields(input: {
  fields: Record<string, string>;
  locales: string[];
}): Promise<AiResult<Record<string, Record<string, string>>>> {
  await requireAdmin();
  const fields = Object.fromEntries(Object.entries(input.fields).filter(([, v]) => v.trim()));
  if (!Object.keys(fields).length) return { error: "ไม่มีข้อความภาษาไทยให้แปล" };
  return run(async () => {
    const out: Record<string, Record<string, string>> = {};
    for (const locale of input.locales.filter((l) => l !== "th")) {
      out[locale] = await translateFields(locale, fields);
    }
    return out;
  });
}
