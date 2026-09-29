"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { Prisma, type PostStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";
import { getOrCreateMedia } from "@/lib/media";
import { diffFields, logActivity } from "@/lib/activity-log";

const faqItem = z.object({
  qTh: z.string().max(500),
  aTh: z.string().max(3000),
  qEn: z.string().max(500),
  aEn: z.string().max(3000),
});

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
  categoryId: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  publishedAt: z.string().optional().or(z.literal("")),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDesc: z.string().max(300).optional().or(z.literal("")),
  seoTitleEn: z.string().max(120).optional().or(z.literal("")),
  seoDescEn: z.string().max(300).optional().or(z.literal("")),
  seoNoIndex: z.boolean().optional(),
  focusKeyword: z.string().max(120).optional().or(z.literal("")),
  secondaryKeywords: z.array(z.string().max(120)).max(20).optional(),
  ogTitle: z.string().max(200).optional().or(z.literal("")),
  ogTitleEn: z.string().max(200).optional().or(z.literal("")),
  ogDesc: z.string().max(300).optional().or(z.literal("")),
  ogDescEn: z.string().max(300).optional().or(z.literal("")),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  marketingEligible: z.boolean().optional(),
  faq: z.array(faqItem).max(30).optional(),
  schemaArticle: z.record(z.string(), z.unknown()).nullable().optional(),
  relatedPostIds: z.array(z.string()).max(12).optional(),
  relatedProductIds: z.array(z.string()).max(12).optional(),
});

export type PostFormInput = z.infer<typeof postSchema>;
export type PostActionResult = { error: string } | { error?: undefined; id: string; slug: string };

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

/** Appends -2, -3, … until the slug is free (the legacy form auto-resolved clashes the same way). */
async function uniqueSlug(slug: string, excludeId?: string) {
  let candidate = slug;
  for (let n = 2; ; n++) {
    const clash = await prisma.post.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${slug}-${n}`;
  }
}

function toData(data: PostFormInput) {
  const nullable = (v?: string) => v || null;
  return {
    kind: data.kind,
    status: data.status,
    titleTh: data.titleTh,
    titleEn: nullable(data.titleEn),
    excerptTh: nullable(data.excerptTh),
    excerptEn: nullable(data.excerptEn),
    bodyTh: nullable(data.bodyTh),
    bodyEn: nullable(data.bodyEn),
    featured: data.featured ?? false,
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
    faq: data.faq?.some((f) => f.qTh.trim() && f.aTh.trim())
      ? data.faq.filter((f) => f.qTh.trim() && f.aTh.trim())
      : Prisma.DbNull,
    schemaArticle: data.schemaArticle ? (data.schemaArticle as Prisma.InputJsonValue) : Prisma.DbNull,
    relatedPostIds: data.relatedPostIds ?? [],
    relatedProductIds: data.relatedProductIds ?? [],
  };
}

function parsePublishedAt(value: string | undefined, fallback: Date | null, status: PostStatus): Date | null {
  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return status === "PUBLISHED" ? fallback ?? new Date() : fallback;
}

function revalidateAll() {
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidateSite();
}

function parseInput(input: PostFormInput, role: string): { data: PostFormInput } | { error: string } {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const data = parsed.data;
  // Contributors can edit but never publish — their saves always land as draft.
  if (!canDo(role, "article.publish")) data.status = "DRAFT";
  return { data };
}

export async function createPost(input: PostFormInput): Promise<PostActionResult> {
  const session = await requirePermission("article.create");
  const parsed = parseInput(input, session.user.role);
  if ("error" in parsed) return { error: parsed.error };
  const data = parsed.data;

  const coverImageId = await resolveCoverImageId(data.coverImageUrl);
  const { categoryId, category } = await resolveCategory(data.categoryId);
  const post = await prisma.post.create({
    data: {
      ...toData(data),
      slug: await uniqueSlug(data.slug),
      categoryId,
      category,
      coverImageId,
      authorId: session.user.id,
      publishedAt: parsePublishedAt(data.publishedAt, null, data.status),
    },
  });

  await logActivity(session.user, "create", "Post", { targetId: post.id, targetLabel: post.titleTh });
  revalidateAll();
  return { id: post.id, slug: post.slug };
}

export async function updatePost(id: string, input: PostFormInput): Promise<PostActionResult> {
  const session = await requirePermission("article.edit");
  const parsed = parseInput(input, session.user.role);
  if ("error" in parsed) return { error: parsed.error };
  const data = parsed.data;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  const coverImageId = data.coverImageUrl ? await resolveCoverImageId(data.coverImageUrl) : null;
  const { categoryId, category } = await resolveCategory(data.categoryId);

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...toData(data),
      slug: await uniqueSlug(data.slug, id),
      categoryId,
      category,
      coverImageId,
      publishedAt: parsePublishedAt(data.publishedAt, existing.publishedAt, data.status),
    },
  });

  const published = existing.status !== "PUBLISHED" && post.status === "PUBLISHED";
  await logActivity(session.user, published ? "publish" : "update", "Post", {
    targetId: post.id,
    targetLabel: post.titleTh,
    changedFields: diffFields(existing, post),
  });
  revalidateAll();
  return { id: post.id, slug: post.slug };
}

// ───────────────────────── Trash (soft delete) ─────────────────────────

/** Moves posts to the trash, remembering their status so a restore puts them back as they were. */
export async function trashPosts(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("article.delete");
  const posts = await prisma.post.findMany({ where: { id: { in: ids }, deletedAt: null } });
  await prisma.$transaction(
    posts.map((p) =>
      prisma.post.update({
        where: { id: p.id },
        data: { deletedAt: new Date(), deletedPrevStatus: p.status, status: "DRAFT" },
      }),
    ),
  );
  await logActivity(session.user, "trash", "Post", {
    targetId: posts.length === 1 ? posts[0].id : null,
    targetLabel: posts.length === 1 ? posts[0].titleTh : null,
    details: `${posts.length} บทความ`,
  });
  revalidateAll();
  return {};
}

export async function restorePosts(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("article.delete");
  const posts = await prisma.post.findMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  await prisma.$transaction(
    posts.map((p) =>
      prisma.post.update({
        where: { id: p.id },
        data: { deletedAt: null, deletedPrevStatus: null, status: (p.deletedPrevStatus as PostStatus | null) ?? "DRAFT" },
      }),
    ),
  );
  await logActivity(session.user, "restore", "Post", { details: `${posts.length} บทความ` });
  revalidateAll();
  return {};
}

/** Permanently deletes posts that are already in the trash. */
export async function purgePosts(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("article.delete");
  const { count } = await prisma.post.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "Post", { details: `ลบถาวร ${count} บทความ` });
  revalidateAll();
  return {};
}

export async function emptyPostTrash(): Promise<{ error?: string }> {
  const session = await requirePermission("article.delete");
  const { count } = await prisma.post.deleteMany({ where: { deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "Post", { details: `ล้างถังขยะ ${count} บทความ` });
  revalidateAll();
  return {};
}

// ───────────────────────── Inline / bulk edits from the list ─────────────────────────

export async function setPostsStatus(ids: string[], status: PostStatus): Promise<{ error?: string }> {
  const session = await requirePermission("article.publish");
  const posts = await prisma.post.findMany({ where: { id: { in: ids } }, select: { id: true, publishedAt: true, titleTh: true } });
  await prisma.$transaction(
    posts.map((p) =>
      prisma.post.update({
        where: { id: p.id },
        data: { status, publishedAt: status === "PUBLISHED" ? p.publishedAt ?? new Date() : p.publishedAt },
      }),
    ),
  );
  await logActivity(session.user, status === "PUBLISHED" ? "publish" : "status_change", "Post", {
    targetId: posts.length === 1 ? posts[0].id : null,
    targetLabel: posts.length === 1 ? posts[0].titleTh : null,
    details: `${posts.length} บทความ → ${status}`,
  });
  revalidateAll();
  return {};
}

export async function setPostStatus(id: string, status: PostStatus): Promise<{ error?: string }> {
  return setPostsStatus([id], status);
}

export async function setPostKind(id: string, kind: "ARTICLE" | "NEWS"): Promise<{ error?: string }> {
  const session = await requirePermission("article.edit");
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };
  await prisma.post.update({ where: { id }, data: { kind } });
  await logActivity(session.user, "update", "Post", { targetId: id, targetLabel: existing.titleTh, changedFields: ["kind"] });
  revalidateAll();
  return {};
}

export async function setPostCategory(id: string, categoryId: string): Promise<{ error?: string }> {
  const session = await requirePermission("article.edit");
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };
  const { categoryId: resolvedId, category } = await resolveCategory(categoryId);
  await prisma.post.update({ where: { id }, data: { categoryId: resolvedId, category } });
  await logActivity(session.user, "update", "Post", { targetId: id, targetLabel: existing.titleTh, changedFields: ["categoryId"] });
  revalidateAll();
  return {};
}

/** Inline title edit from the list (legacy InlineText). */
export async function renamePost(id: string, field: "titleTh" | "titleEn", value: string): Promise<{ error?: string }> {
  const session = await requirePermission("article.edit");
  const title = value.trim();
  if (field === "titleTh" && !title) return { error: "ชื่อเรื่องต้องไม่ว่าง" };
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };
  await prisma.post.update({ where: { id }, data: { [field]: title || null } });
  await logActivity(session.user, "update", "Post", { targetId: id, targetLabel: title || existing.titleTh, changedFields: [field] });
  revalidateAll();
  return {};
}

export async function togglePostStatus(id: string): Promise<{ error?: string }> {
  const existing = await prisma.post.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { error: "ไม่พบบทความ" };
  return setPostsStatus([id], existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");
}

// Named bulk actions so the (server-rendered) list can hand them to <BulkActionBar>.
export async function publishPosts(ids: string[]) {
  return setPostsStatus(ids, "PUBLISHED");
}
export async function draftPosts(ids: string[]) {
  return setPostsStatus(ids, "DRAFT");
}
export async function archivePosts(ids: string[]) {
  return setPostsStatus(ids, "ARCHIVED");
}
