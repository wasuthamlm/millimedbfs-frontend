"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const categorySchema = z.object({
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อไทย").max(120),
  nameEn: z.string().max(120).optional().or(z.literal("")),
  slug: z.string().min(1).max(120),
});

function revalidateAll() {
  revalidatePath("/admin/articles/categories");
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/news");
}

export async function createArticleCategory(input: z.infer<typeof categorySchema>) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  try {
    await prisma.articleCategory.create({
      data: { nameTh: parsed.data.nameTh, nameEn: parsed.data.nameEn || null, slug: parsed.data.slug },
    });
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Slug นี้ถูกใช้แล้ว" };
    }
    throw err;
  }
}

export async function updateArticleCategory(id: string, input: z.infer<typeof categorySchema>) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  try {
    await prisma.articleCategory.update({
      where: { id },
      data: { nameTh: parsed.data.nameTh, nameEn: parsed.data.nameEn || null, slug: parsed.data.slug },
    });
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Slug นี้ถูกใช้แล้ว" };
    }
    throw err;
  }
}

export async function deleteArticleCategory(id: string) {
  await requireAdmin();
  await prisma.articleCategory.delete({ where: { id } });
  revalidateAll();
  return {};
}

export async function toggleArticleCategory(id: string, active: boolean) {
  await requireAdmin();
  await prisma.articleCategory.update({ where: { id }, data: { active } });
  revalidateAll();
  return {};
}

export async function reorderArticleCategories(ids: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    ids.map((id, index) => prisma.articleCategory.update({ where: { id }, data: { order: index } }))
  );
  revalidateAll();
  return {};
}
