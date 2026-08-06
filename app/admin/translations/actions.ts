"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { translateFields } from "@/lib/translate";
import type { TranslatableEntity } from "@/lib/generated/prisma/client";

const CONTENT_FIELDS: Record<TranslatableEntity, readonly string[]> = {
  ARTICLE: ["title", "excerpt", "body"],
  PRODUCT: ["name", "description"],
};

async function getSourceFields(
  entityType: TranslatableEntity,
  id: string,
): Promise<Record<string, string> | null> {
  if (entityType === "ARTICLE") {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return null;
    return { title: post.titleTh, excerpt: post.excerptTh ?? "", body: post.bodyTh ?? "" };
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;
  return { name: product.nameTh, description: product.descriptionTh ?? "" };
}

export async function getPendingItemIds(entityType: TranslatableEntity, locale: string): Promise<string[]> {
  await requireAdmin();

  const items =
    entityType === "ARTICLE"
      ? await prisma.post.findMany({ select: { id: true } })
      : await prisma.product.findMany({ select: { id: true } });

  const existing = await prisma.translation.findMany({
    where: { entityType, locale, entityId: { in: items.map((i) => i.id) } },
    select: { entityId: true },
  });
  const alreadyTranslated = new Set(existing.map((e) => e.entityId));
  return items.map((i) => i.id).filter((id) => !alreadyTranslated.has(id));
}

export async function translateItem(
  entityType: TranslatableEntity,
  entityId: string,
  locale: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const fieldKeys = CONTENT_FIELDS[entityType];
  const source = await getSourceFields(entityType, entityId);
  if (!source) return { ok: false, error: "ไม่พบข้อมูลต้นฉบับ" };

  try {
    const result = await translateFields(locale, source);
    await prisma.$transaction(
      fieldKeys.map((field) =>
        prisma.translation.upsert({
          where: { entityType_entityId_locale_field: { entityType, entityId, locale, field } },
          update: { value: result[field] ?? "" },
          create: { entityType, entityId, locale, field, value: result[field] ?? "" },
        }),
      ),
    );
    revalidatePath("/admin/translations");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "แปลไม่สำเร็จ" };
  }
}
