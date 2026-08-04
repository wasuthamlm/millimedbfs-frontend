"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getOrCreateMedia } from "@/lib/media";

const productSchema = z.object({
  sku: z.string().min(1, "จำเป็นต้องระบุ SKU").max(64),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อสินค้า").max(300),
  nameEn: z.string().max(300).optional().or(z.literal("")),
  descriptionTh: z.string().optional().or(z.literal("")),
  descriptionEn: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export type ProductFormInput = z.infer<typeof productSchema>;
export type ProductActionResult = { error: string } | { error?: undefined; id: string };

function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
}

async function resolveImageId(imageUrl?: string) {
  if (!imageUrl) return null;
  const media = await getOrCreateMedia(prisma, imageUrl);
  return media.id;
}

export async function createProduct(input: ProductFormInput): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
    const imageId = await resolveImageId(data.imageUrl);
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        status: data.status,
        nameTh: data.nameTh,
        nameEn: data.nameEn || null,
        descriptionTh: data.descriptionTh || null,
        descriptionEn: data.descriptionEn || null,
        imageId,
      },
    });

    revalidateAll();
    return { id: product.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น" };
    }
    throw err;
  }
}

export async function updateProduct(
  id: string,
  input: ProductFormInput,
): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return { error: "ไม่พบสินค้า" };
  }

  try {
    const imageId = data.imageUrl ? await resolveImageId(data.imageUrl) : existing.imageId;

    const product = await prisma.product.update({
      where: { id },
      data: {
        sku: data.sku,
        status: data.status,
        nameTh: data.nameTh,
        nameEn: data.nameEn || null,
        descriptionTh: data.descriptionTh || null,
        descriptionEn: data.descriptionEn || null,
        imageId,
      },
    });

    revalidateAll();
    return { id: product.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น" };
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบสินค้า" };

  await prisma.product.delete({ where: { id } });
  revalidateAll();
  return {};
}
