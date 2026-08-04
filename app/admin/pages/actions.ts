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
    .regex(/^[a-z0-9-]+$/, "สลักต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น"),
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
    return { slug: page.slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
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
