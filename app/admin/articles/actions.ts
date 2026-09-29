"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { Prisma, type PostStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";
import { getOrCreateMedia } from "@/lib/media";

const postSchema = z.object({
  kind: z.enum(["ARTICLE", "NEWS"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  slug: z
    .string()
    .min(1, "จำเป็นต้องระบุสลัก")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "สลักต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น"),
  titleTh: z.string().min(1, "จำเป็นต้องระบุชื่อเรื่อง").max(300),
  titleEn: z.string().max(300).optional().or(z.literal("")),
  excerptTh: z.string().max(500).optional().or(z.literal("")),
  excerptEn: z.string().max(500).optional().or(z.literal("")),
  bodyTh: z.string().optional().or(z.literal("")),
  bodyEn: z.string().optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(70).optional().or(z.literal("")),
  seoDesc: z.string().max(200).optional().or(z.literal("")),
  seoTitleEn: z.string().max(70).optional().or(z.literal("")),
  seoDescEn: z.string().max(200).optional().or(z.literal("")),
  seoNoIndex: z.boolean().optional(),
});

export type PostFormInput = z.infer<typeof postSchema>;
export type PostActionResult = { error: string } | { error?: undefined; id: string };

async function resolveCoverImageId(coverImageUrl?: string) {
  if (!coverImageUrl) return null;
  const media = await getOrCreateMedia(prisma, coverImageUrl);
  return media.id;
}

/** categoryId is the source of truth; `category` (legacy free-text, still shown on the public site) is kept in sync from it. */
async function resolveCategory(categoryId?: string) {
  if (!categoryId) return { categoryId: null, category: null };
  const cat = await prisma.articleCategory.findUnique({ where: { id: categoryId } });
  return { categoryId: cat?.id ?? null, category: cat?.nameTh ?? null };
}

function revalidateAll() {
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidateSite();
}

export async function createPost(input: PostFormInput): Promise<PostActionResult> {
  const session = await requirePermission("article.create");

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;
  // Contributors can edit but never publish — their saves always land as draft.
  if (!canDo(session.user.role, "article.publish")) data.status = "DRAFT";

  try {
    const coverImageId = await resolveCoverImageId(data.coverImageUrl);
    const { categoryId, category } = await resolveCategory(data.categoryId);
    const post = await prisma.post.create({
      data: {
        kind: data.kind,
        status: data.status,
        slug: data.slug,
        titleTh: data.titleTh,
        titleEn: data.titleEn || null,
        excerptTh: data.excerptTh || null,
        excerptEn: data.excerptEn || null,
        bodyTh: data.bodyTh || null,
        bodyEn: data.bodyEn || null,
        categoryId,
        category,
        featured: data.featured ?? false,
        coverImageId,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        seoTitleEn: data.seoTitleEn || null,
        seoDescEn: data.seoDescEn || null,
        seoNoIndex: data.seoNoIndex ?? false,
      },
    });

    revalidateAll();
    return { id: post.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function updatePost(id: string, input: PostFormInput): Promise<PostActionResult> {
  const session = await requirePermission("article.edit");

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;
  // Contributors can edit but never publish — their saves always land as draft.
  if (!canDo(session.user.role, "article.publish")) data.status = "DRAFT";

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return { error: "ไม่พบบทความ" };
  }

  try {
    const coverImageId = data.coverImageUrl
      ? await resolveCoverImageId(data.coverImageUrl)
      : existing.coverImageId;
    const { categoryId, category } = await resolveCategory(data.categoryId);

    const publishedAt =
      data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt;

    const post = await prisma.post.update({
      where: { id },
      data: {
        kind: data.kind,
        status: data.status,
        slug: data.slug,
        titleTh: data.titleTh,
        titleEn: data.titleEn || null,
        excerptTh: data.excerptTh || null,
        excerptEn: data.excerptEn || null,
        bodyTh: data.bodyTh || null,
        bodyEn: data.bodyEn || null,
        categoryId,
        category,
        featured: data.featured ?? false,
        coverImageId,
        publishedAt,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null,
        seoTitleEn: data.seoTitleEn || null,
        seoDescEn: data.seoDescEn || null,
        seoNoIndex: data.seoNoIndex ?? false,
      },
    });

    revalidateAll();

    return { id: post.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  await requirePermission("article.delete");

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  await prisma.post.delete({ where: { id } });
  revalidateAll();
  return {};
}

export async function setPostStatus(id: string, status: PostStatus): Promise<{ error?: string }> {
  await requirePermission("article.publish");

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  await prisma.post.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });

  revalidateAll();
  return {};
}

export async function setPostKind(id: string, kind: "ARTICLE" | "NEWS"): Promise<{ error?: string }> {
  await requirePermission("article.edit");

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  await prisma.post.update({ where: { id }, data: { kind } });

  revalidateAll();
  return {};
}

export async function setPostCategory(id: string, categoryId: string): Promise<{ error?: string }> {
  await requirePermission("article.edit");

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  const { categoryId: resolvedId, category } = await resolveCategory(categoryId);
  await prisma.post.update({ where: { id }, data: { categoryId: resolvedId, category } });

  revalidateAll();
  return {};
}

export async function togglePostStatus(id: string): Promise<{ error?: string }> {
  await requirePermission("article.publish");

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.post.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt:
        nextStatus === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });

  revalidateAll();
  return {};
}
