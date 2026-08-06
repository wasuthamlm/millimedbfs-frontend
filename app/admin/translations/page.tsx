import { prisma } from "@/lib/prisma";
import { TRANSLATION_LOCALES } from "@/lib/translation-locales";
import { TranslationStatusClient } from "@/components/admin/translations/TranslationStatusClient";

export const dynamic = "force-dynamic";

const CONTENT_TYPES = [
  { type: "ARTICLE" as const, label: "Articles" },
  { type: "PRODUCT" as const, label: "Products" },
];

export default async function AdminTranslationsPage() {
  const [postCount, productCount, translations] = await Promise.all([
    prisma.post.count(),
    prisma.product.count(),
    prisma.translation.findMany({ select: { entityType: true, entityId: true, locale: true } }),
  ]);

  const translatedIdsByKey = new Map<string, Set<string>>();
  for (const t of translations) {
    const key = `${t.entityType}:${t.locale}`;
    if (!translatedIdsByKey.has(key)) translatedIdsByKey.set(key, new Set());
    translatedIdsByKey.get(key)!.add(t.entityId);
  }

  const totals: Record<string, number> = { ARTICLE: postCount, PRODUCT: productCount };

  const sections = CONTENT_TYPES.map((ct) => ({
    type: ct.type,
    label: ct.label,
    total: totals[ct.type],
    locales: TRANSLATION_LOCALES.map((locale) => ({
      ...locale,
      translatedCount: translatedIdsByKey.get(`${ct.type}:${locale.code}`)?.size ?? 0,
    })),
  }));

  return <TranslationStatusClient sections={sections} />;
}
