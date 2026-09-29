import { z } from "zod";
import { languageName } from "@/lib/translation-locales";
import { generateJson } from "@/lib/ai";

// Rules ported from the legacy site's translateContent function.
function buildSystemPrompt(targetLang: string) {
  const name = languageName(targetLang);
  return `You are a professional translator and SEO/AEO/GEO expert. Translate the given Thai content to ${name}.
Rules:
- Preserve any HTML tags exactly as they appear
- Keep brand names and proper nouns in their original form
- Write natural, direct, factual language; FAQ answers must be natural, direct and factual
- Fields named seoTitle/metaTitle: at most 60 characters in the target language
- Fields named seoDesc/metaDesc: at most 155 characters in the target language
- SEO: keep the translated primary keyword natural in the title, meta description and first heading
- For Chinese use Simplified Chinese (简体中文); for Korean/Japanese use a formal/polite register
Return ONLY a JSON object with exactly the same keys as the input.`;
}

export async function translateFields(
  locale: string,
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  // An explicit object schema (not a record) so structured outputs can enforce every key.
  const schema = z.object(Object.fromEntries(Object.keys(fields).map((k) => [k, z.string()])));
  const result = await generateJson(schema, {
    system: buildSystemPrompt(locale),
    user: `Thai source fields (JSON):\n${JSON.stringify(fields, null, 2)}\n\nTranslate every field's value to ${languageName(locale)}. Return a JSON object with exactly the same keys.`,
  });
  return result as Record<string, string>;
}
