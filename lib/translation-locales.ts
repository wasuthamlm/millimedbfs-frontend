export const TRANSLATION_LOCALES = [
  { code: "en", badge: "GB", label: "English" },
  { code: "zh", badge: "CN", label: "中文" },
  { code: "ko", badge: "KR", label: "한국어" },
  { code: "ja", badge: "JP", label: "日本語" },
  { code: "my", badge: "MM", label: "မြန်မာ" },
  { code: "lo", badge: "LA", label: "ລາວ" },
  { code: "vi", badge: "VN", label: "Tiếng Việt" },
  { code: "ms", badge: "MY", label: "Bahasa Melayu" },
] as const;

export type TranslationLocaleCode = (typeof TRANSLATION_LOCALES)[number]["code"];

const LANG_NAMES: Record<TranslationLocaleCode, string> = {
  en: "English",
  zh: "Chinese Simplified (简体中文)",
  ko: "Korean (한국어, formal/polite register)",
  ja: "Japanese (日本語, formal/polite register)",
  my: "Burmese (မြန်မာဘာသာ)",
  lo: "Lao (ພາສາລາວ)",
  vi: "Vietnamese (Tiếng Việt)",
  ms: "Malay (Bahasa Melayu)",
};

export function languageName(code: string): string {
  return LANG_NAMES[code as TranslationLocaleCode] ?? code;
}
