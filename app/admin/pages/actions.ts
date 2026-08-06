"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const pageSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
  slug: z
    .string()
    .min(1, "จำเป็นต้องระบุสลัก")
    .max(160)
    .regex(/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/, "สลักต้องเป็นตัวอักษร ตัวเลข ขีดกลาง ขีดล่าง และ / สำหรับหน้าย่อยเท่านั้น"),
  titleTh: z.string().min(1, "จำเป็นต้องระบุชื่อหน้า").max(200),
  titleEn: z.string().max(200).optional().or(z.literal("")),
});

export type PageFormInput = z.infer<typeof pageSchema>;
export type PageActionResult = { error: string } | { error?: undefined; slug: string };

export async function createPage(input: PageFormInput): Promise<PageActionResult> {
  await requireAdmin();

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
    const page = await prisma.page.create({
      data: {
        status: data.status,
        slug: data.slug,
        titleTh: data.titleTh,
        titleEn: data.titleEn || null,
      },
    });

    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");
    return { slug: page.slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function setPageStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  await requireAdmin();
  await prisma.page.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function setPageSeo(id: string, seoTitle: string, seoDesc: string): Promise<{ error?: string }> {
  await requireAdmin();
  await prisma.page.update({ where: { id }, data: { seoTitle: seoTitle || null, seoDesc: seoDesc || null } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function archivePages(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length === 0) return {};
  await prisma.page.updateMany({ where: { id: { in: ids } }, data: { archived: true } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function restorePages(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length === 0) return {};
  await prisma.page.updateMany({ where: { id: { in: ids } }, data: { archived: false } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}

export async function deletePage(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบหน้านี้" };

  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return {};
}
