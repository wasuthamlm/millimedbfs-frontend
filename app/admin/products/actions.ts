"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { Prisma, type ProductStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { requirePermission } from "@/lib/require-admin";
import { diffFields, logActivity } from "@/lib/activity-log";
import { canDo } from "@/lib/admin-roles";
import { getOrCreateMedia } from "@/lib/media";

const optional = (max: number) => z.string().max(max).optional().or(z.literal(""));

const productSchema = z.object({
  sku: z.string().min(1, "จำเป็นต้องระบุ SKU").max(64),
  slug: z
    .string()
    .min(1, "จำเป็นต้องระบุสลัก")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "สลักต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อสินค้า").max(300),
  nameEn: optional(300),
  shortDescTh: optional(500),
  shortDescEn: optional(500),
  descriptionTh: z.string().optional().or(z.literal("")),
  descriptionEn: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  gallery: z.array(z.object({ url: z.string().url(), alt: z.string().max(300) })).max(30).optional(),
  categoryId: z.string().optional().or(z.literal("")),
  subCategoryId: z.string().optional().or(z.literal("")),
  unit: optional(50),
  price: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  seoTitle: optional(120),
  seoDesc: optional(300),
  seoTitleEn: optional(120),
  seoDescEn: optional(300),
  seoNoIndex: z.boolean().optional(),
  focusKeyword: optional(120),
  secondaryKeywords: z.array(z.string().max(120)).max(20).optional(),
  ogTitle: optional(200),
  ogTitleEn: optional(200),
  ogDesc: optional(300),
  ogDescEn: optional(300),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  marketingEligible: z.boolean().optional(),
});

/** Descriptions may be plain text (imported) or HTML (editor) — only HTML is sanitized, so "&" in plain text stays as typed. */
const cleanRich = (v?: string) => (v && /<[a-z][\s\S]*>/i.test(v) ? sanitizeHtml(v) : v);

export type ProductFormInput = z.infer<typeof productSchema>;
export type ProductActionResult = { error: string } | { error?: undefined; id: string; slug: string };

function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateSite();
}

async function resolveImageId(imageUrl?: string) {
  if (!imageUrl) return null;
  const media = await getOrCreateMedia(prisma, imageUrl);
  return media.id;
}

function parsePrice(price?: string): number | null {
  if (!price) return null;
  const n = Number(price);
  return Number.isFinite(n) ? n : null;
}

async function uniqueSlug(slug: string, excludeId?: string) {
  let candidate = slug;
  for (let n = 2; ; n++) {
    const clash = await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${slug}-${n}`;
  }
}

function parseInput(input: ProductFormInput, role: string): { data: ProductFormInput } | { error: string } {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const data = parsed.data;
  // Contributors can edit but never publish — their saves always land as draft.
  if (!canDo(role, "product.publish")) data.status = "DRAFT";
  return { data };
}

function toData(data: ProductFormInput) {
  const nullable = (v?: string) => v || null;
  return {
    sku: data.sku,
    status: data.status,
    nameTh: data.nameTh,
    nameEn: nullable(data.nameEn),
    shortDescTh: nullable(data.shortDescTh),
    shortDescEn: nullable(data.shortDescEn),
    // Rich text is sanitized on save as well as on render.
    descriptionTh: nullable(cleanRich(data.descriptionTh)),
    descriptionEn: nullable(cleanRich(data.descriptionEn)),
    categoryId: nullable(data.categoryId),
    subCategoryId: nullable(data.subCategoryId),
    unit: nullable(data.unit),
    price: parsePrice(data.price),
    seoTitle: nullable(data.seoTitle),
    seoDesc: nullable(data.seoDesc),
    seoTitleEn: nullable(data.seoTitleEn),
    seoDescEn: nullable(data.seoDescEn),
    seoNoIndex: data.seoNoIndex ?? false,
    focusKeyword: nullable(data.focusKeyword),
    secondaryKeywords: (data.secondaryKeywords ?? []).map((k) => k.trim()).filter(Boolean),
    ogTitle: nullable(data.ogTitle),
    ogTitleEn: nullable(data.ogTitleEn),
    ogDesc: nullable(data.ogDesc),
    ogDescEn: nullable(data.ogDescEn),
    ogImageUrl: nullable(data.ogImageUrl),
    canonicalUrl: nullable(data.canonicalUrl),
    marketingEligible: data.marketingEligible ?? false,
  };
}

function galleryCreate(gallery: ProductFormInput["gallery"]) {
  return (gallery ?? []).map((g, i) => ({ url: g.url, alt: g.alt || null, order: i }));
}

function skuClash(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function createProduct(input: ProductFormInput): Promise<ProductActionResult> {
  const session = await requirePermission("product.create");
  const parsed = parseInput(input, session.user.role);
  if ("error" in parsed) return { error: parsed.error };
  const data = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...toData(data),
        slug: await uniqueSlug(data.slug),
        imageId: await resolveImageId(data.imageUrl),
        featured: data.featured ?? false,
        bestSeller: data.bestSeller ?? false,
        gallery: { create: galleryCreate(data.gallery) },
      },
    });
    await logActivity(session.user, "create", "Product", { targetId: product.id, targetLabel: product.nameTh });
    revalidateAll();
    return { id: product.id, slug: product.slug ?? data.slug };
  } catch (err) {
    if (skuClash(err)) return { error: "SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น" };
    throw err;
  }
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ProductActionResult> {
  const session = await requirePermission("product.edit");
  const parsed = parseInput(input, session.user.role);
  if ("error" in parsed) return { error: parsed.error };
  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบสินค้า" };

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...toData(data),
          slug: await uniqueSlug(data.slug, id),
          imageId: data.imageUrl ? await resolveImageId(data.imageUrl) : null,
          featured: data.featured ?? existing.featured,
          bestSeller: data.bestSeller ?? existing.bestSeller,
          gallery: { create: galleryCreate(data.gallery) },
        },
      });
    });
    const published = existing.status !== "ACTIVE" && product.status === "ACTIVE";
    await logActivity(session.user, published ? "publish" : "update", "Product", {
      targetId: product.id,
      targetLabel: product.nameTh,
      changedFields: diffFields(existing, product),
    });
    revalidateAll();
    return { id: product.id, slug: product.slug ?? data.slug };
  } catch (err) {
    if (skuClash(err)) return { error: "SKU นี้ถูกใช้แล้ว กรุณาเลือก SKU อื่น" };
    throw err;
  }
}

// ───────────────────────── Trash (soft delete) ─────────────────────────

export async function trashProducts(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("product.delete");
  const products = await prisma.product.findMany({ where: { id: { in: ids }, deletedAt: null } });
  await prisma.$transaction(
    products.map((p) =>
      prisma.product.update({ where: { id: p.id }, data: { deletedAt: new Date(), deletedPrevStatus: p.status, status: "DRAFT" } }),
    ),
  );
  await logActivity(session.user, "trash", "Product", {
    targetId: products.length === 1 ? products[0].id : null,
    targetLabel: products.length === 1 ? products[0].nameTh : null,
    details: `${products.length} สินค้า`,
  });
  revalidateAll();
  return {};
}

export async function restoreProducts(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("product.delete");
  const products = await prisma.product.findMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  await prisma.$transaction(
    products.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: { deletedAt: null, deletedPrevStatus: null, status: (p.deletedPrevStatus as ProductStatus | null) ?? "DRAFT" },
      }),
    ),
  );
  await logActivity(session.user, "restore", "Product", { details: `${products.length} สินค้า` });
  revalidateAll();
  return {};
}

export async function purgeProducts(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("product.delete");
  const { count } = await prisma.product.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "Product", { details: `ลบถาวร ${count} สินค้า` });
  revalidateAll();
  return {};
}

export async function emptyProductTrash(): Promise<{ error?: string }> {
  const session = await requirePermission("product.delete");
  const { count } = await prisma.product.deleteMany({ where: { deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "Product", { details: `ล้างถังขยะ ${count} สินค้า` });
  revalidateAll();
  return {};
}

// ───────────────────────── Inline / bulk edits ─────────────────────────

export async function setProductsStatus(ids: string[], status: ProductStatus): Promise<{ error?: string }> {
  const session = await requirePermission("product.publish");
  const { count } = await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status } });
  await logActivity(session.user, status === "ACTIVE" ? "publish" : "status_change", "Product", { details: `${count} สินค้า → ${status}` });
  revalidateAll();
  return {};
}

export async function setProductStatus(id: string, status: ProductStatus) {
  return setProductsStatus([id], status);
}
export async function activateProducts(ids: string[]) {
  return setProductsStatus(ids, "ACTIVE");
}
export async function draftProducts(ids: string[]) {
  return setProductsStatus(ids, "DRAFT");
}
export async function archiveProducts(ids: string[]) {
  return setProductsStatus(ids, "ARCHIVED");
}

export async function renameProduct(id: string, field: "nameTh" | "nameEn", value: string): Promise<{ error?: string }> {
  const session = await requirePermission("product.edit");
  const name = value.trim();
  if (field === "nameTh" && !name) return { error: "ชื่อสินค้าต้องไม่ว่าง" };
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบสินค้า" };
  await prisma.product.update({ where: { id }, data: { [field]: name || null } });
  await logActivity(session.user, "update", "Product", { targetId: id, targetLabel: name || existing.nameTh, changedFields: [field] });
  revalidateAll();
  return {};
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  const session = await requirePermission("product.edit");
  await prisma.product.update({ where: { id }, data: { featured } });
  await logActivity(session.user, "update", "Product", { targetId: id, changedFields: ["featured"] });
  revalidateAll();
  return {};
}

export async function toggleProductBestSeller(id: string, bestSeller: boolean) {
  const session = await requirePermission("product.edit");
  await prisma.product.update({ where: { id }, data: { bestSeller } });
  await logActivity(session.user, "update", "Product", { targetId: id, changedFields: ["bestSeller"] });
  revalidateAll();
  return {};
}
