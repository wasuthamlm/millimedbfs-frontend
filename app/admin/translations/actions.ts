"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { translateFields } from "@/lib/translate";
import { revalidateSite } from "@/lib/revalidate-site";
import { isTranslatableType, sourceFields, translatableIds } from "@/lib/translation-sources";

/** Items of `entityType` that have no translation yet in `locale`. */
export async function getPendingItemIds(entityType: string, locale: string): Promise<string[]> {
  await requirePermission("translation.edit");
  if (!isTranslatableType(entityType)) return [];

  const ids = await translatableIds(entityType);
  const existing = await prisma.translation.findMany({
    where: { entityType, locale, entityId: { in: ids } },
    select: { entityId: true },
    distinct: ["entityId"],
  });
  const done = new Set(existing.map((e) => e.entityId));
  return ids.filter((id) => !done.has(id));
}

export async function translateItem(entityType: string, entityId: string, locale: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requirePermission("translation.edit");
  if (!isTranslatableType(entityType)) return { ok: false, error: "ยังไม่รองรับการแปลข้อมูลประเภทนี้" };
  if (locale === "th") return { ok: false, error: "ภาษาไทยเป็นภาษาต้นฉบับ" };

  const source = await sourceFields(entityType, entityId);
  if (!source) return { ok: false, error: "ไม่พบข้อมูลต้นฉบับ" };
  // Nothing to translate (e.g. a block with no title/body) — mark it done with an empty title row.
  const keys = Object.keys(source);

  try {
    const result = keys.length ? await translateFields(locale, source) : {};
    const rows = keys.length ? keys.map((field) => ({ field, value: result[field] ?? "" })) : [{ field: "_empty", value: "" }];
    await prisma.$transaction(
      rows.map(({ field, value }) =>
        prisma.translation.upsert({
          where: { entityType_entityId_locale_field: { entityType, entityId, locale, field } },
          update: { value },
          create: { entityType, entityId, locale, field, value },
        }),
      ),
    );
    await logActivity(session.user, "translate", "Translation", { targetId: entityId, details: `${entityType} → ${locale}` });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "แปลไม่สำเร็จ" };
  }
}

/** Called once a bulk run finishes so the public site picks up the new text. */
export async function finishTranslationRun(): Promise<void> {
  await requirePermission("translation.edit");
  revalidatePath("/admin/translations");
  revalidateSite();
}

/** Removes every translation of one type in one language (e.g. to re-translate after big edits). */
export async function clearTranslations(entityType: string, locale: string): Promise<{ error?: string; count?: number }> {
  const session = await requirePermission("translation.edit");
  if (!isTranslatableType(entityType)) return { error: "ประเภทไม่ถูกต้อง" };
  const { count } = await prisma.translation.deleteMany({ where: { entityType, locale } });
  await logActivity(session.user, "delete", "Translation", { details: `ล้างคำแปล ${entityType} → ${locale} (${count} แถว)` });
  revalidatePath("/admin/translations");
  revalidateSite();
  return { count };
}
