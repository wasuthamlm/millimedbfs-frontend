"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";
import { diffFields, logActivity } from "@/lib/activity-log";

const categorySchema = z.object({
  nameTh: z.string().min(1, "จำเป็นต้องระบุชื่อไทย").max(120),
  nameEn: z.string().max(120).optional().or(z.literal("")),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9_-]+$/i, "Slug ใช้ได้เฉพาะ a-z, 0-9, - และ _"),
  parentId: z.string().nullable(),
  descriptionTh: z.string().max(2000).optional().or(z.literal("")),
  descriptionEn: z.string().max(2000).optional().or(z.literal("")),
});

type CategoryInput = z.infer<typeof categorySchema>;

function revalidateAll() {
  revalidatePath("/admin/products/categories");
  revalidatePath("/admin/products");
  revalidateSite();
}

function toData(data: CategoryInput) {
  return {
    nameTh: data.nameTh,
    nameEn: data.nameEn || null,
    slug: data.slug,
    parentId: data.parentId,
    descriptionTh: data.descriptionTh || null,
    descriptionEn: data.descriptionEn || null,
  };
}

const slugTaken = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";

export async function createProductCategory(input: CategoryInput) {
  const session = await requirePermission("category.create");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  // Contributors can add categories, but they stay hidden until an approver publishes them.
  const publish = canDo(session.user.role, "category.publish");
  try {
    const siblings = await prisma.productCategory.count({ where: { parentId: parsed.data.parentId } });
    const cat = await prisma.productCategory.create({
      data: { ...toData(parsed.data), order: siblings, active: publish, status: publish ? "PUBLISHED" : "DRAFT" },
    });
    await logActivity(session.user, "create", "ProductCategory", { targetId: cat.id, targetLabel: cat.nameTh });
    revalidateAll();
    return {};
  } catch (err) {
    if (slugTaken(err)) return { error: "Slug นี้ถูกใช้แล้ว" };
    throw err;
  }
}

export async function updateProductCategory(id: string, input: CategoryInput) {
  const session = await requirePermission("category.edit");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  if (parsed.data.parentId === id) return { error: "ไม่สามารถตั้งหมวดหมู่เป็นหมวดแม่ของตัวเองได้" };
  const existing = await prisma.productCategory.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบหมวดหมู่" };
  try {
    const data = toData(parsed.data);
    await prisma.productCategory.update({ where: { id }, data });
    await logActivity(session.user, "update", "ProductCategory", { targetId: id, targetLabel: data.nameTh, changedFields: diffFields(existing, data) });
    revalidateAll();
    return {};
  } catch (err) {
    if (slugTaken(err)) return { error: "Slug นี้ถูกใช้แล้ว" };
    throw err;
  }
}

export async function deleteProductCategories(ids: string[]) {
  const session = await requirePermission("category.delete");
  // Products keep existing — they just lose the category link.
  await prisma.product.updateMany({ where: { categoryId: { in: ids } }, data: { categoryId: null } });
  await prisma.product.updateMany({ where: { subCategoryId: { in: ids } }, data: { subCategoryId: null } });
  const { count } = await prisma.productCategory.deleteMany({ where: { id: { in: ids } } });
  await logActivity(session.user, "delete", "ProductCategory", { details: `${count} หมวดหมู่` });
  revalidateAll();
  return {};
}

export async function deleteProductCategory(id: string) {
  return deleteProductCategories([id]);
}

export async function setProductCategoriesActive(ids: string[], active: boolean) {
  const session = await requirePermission("category.publish");
  await prisma.productCategory.updateMany({ where: { id: { in: ids } }, data: { active, status: active ? "PUBLISHED" : "DRAFT" } });
  await logActivity(session.user, active ? "enable" : "disable", "ProductCategory", { details: `${ids.length} หมวดหมู่` });
  revalidateAll();
  return {};
}

export async function toggleProductCategory(id: string, active: boolean) {
  return setProductCategoriesActive([id], active);
}

export async function reorderProductCategories(ids: string[]) {
  const session = await requirePermission("category.edit");
  await prisma.$transaction(ids.map((id, index) => prisma.productCategory.update({ where: { id }, data: { order: index } })));
  await logActivity(session.user, "reorder", "ProductCategory");
  revalidateAll();
  return {};
}
