import { prisma } from "@/lib/prisma";
import { TRANSLATION_LOCALES } from "@/lib/translation-locales";
import { getEnabledLocales } from "@/lib/i18n/enabled-locales";
import { TRANSLATABLE_TYPES, translatableIds } from "@/lib/translation-sources";
import { TranslationStatusClient } from "@/components/admin/translations/TranslationStatusClient";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage() {
  const [enabled, translations, idLists] = await Promise.all([
    getEnabledLocales(),
    prisma.translation.findMany({ select: { entityType: true, entityId: true, locale: true }, distinct: ["entityType", "entityId", "locale"] }),
    Promise.all(TRANSLATABLE_TYPES.map((t) => translatableIds(t.type))),
  ]);

  const translatedIdsByKey = new Map<string, Set<string>>();
  for (const t of translations) {
    const key = `${t.entityType}:${t.locale}`;
    if (!translatedIdsByKey.has(key)) translatedIdsByKey.set(key, new Set());
    translatedIdsByKey.get(key)!.add(t.entityId);
  }

  // Only languages switched on in Settings → ภาษา are listed (Thai is the source language).
  const locales = TRANSLATION_LOCALES.filter((l) => enabled.includes(l.code));

  const sections = TRANSLATABLE_TYPES.map((ct, i) => {
    const ids = new Set(idLists[i]);
    return {
      type: ct.type,
      label: ct.label,
      total: ids.size,
      locales: locales.map((locale) => ({
        ...locale,
        translatedCount: [...(translatedIdsByKey.get(`${ct.type}:${locale.code}`) ?? [])].filter((id) => ids.has(id)).length,
      })),
    };
  });

  return <TranslationStatusClient sections={sections} />;
}
