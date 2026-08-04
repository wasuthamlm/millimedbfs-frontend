"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getOrCreateMedia } from "@/lib/media";

const postSchema = z.object({
  kind: z.enum(["ARTICLE", "NEWS"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
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
  featured: z.boolean().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export type PostFormInput = z.infer<typeof postSchema>;
export type PostActionResult = { error: string } | { error?: undefined; id: string };

function publicPathsFor(kind: PostFormInput["kind"], slug: string) {
  return kind === "ARTICLE"
    ? [`/articles`, `/articles/${slug}`]
    : [`/news`, `/news/${slug}`];
}

async function resolveCoverImageId(coverImageUrl?: string) {
  if (!coverImageUrl) return null;
  const media = await getOrCreateMedia(prisma, coverImageUrl);
  return media.id;
}

function revalidateAll(kind: PostFormInput["kind"], slugs: string[]) {
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  for (const slug of slugs) {
    for (const path of publicPathsFor(kind, slug)) {
      revalidatePath(path);
    }
  }
}

export async function createPost(input: PostFormInput): Promise<PostActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
    const coverImageId = await resolveCoverImageId(data.coverImageUrl);
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
        category: data.category || null,
        featured: data.featured ?? false,
        coverImageId,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    revalidateAll(data.kind, [data.slug]);
    return { id: post.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function updatePost(id: string, input: PostFormInput): Promise<PostActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return { error: "ไม่พบบทความ" };
  }

  try {
    const coverImageId = data.coverImageUrl
      ? await resolveCoverImageId(data.coverImageUrl)
      : existing.coverImageId;

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
        category: data.category || null,
        featured: data.featured ?? false,
        coverImageId,
        publishedAt,
      },
    });

    const slugsToRevalidate =
      existing.slug !== data.slug ? [existing.slug, data.slug] : [data.slug];
    revalidateAll(data.kind, slugsToRevalidate);
    if (existing.kind !== data.kind) {
      revalidateAll(existing.kind, [existing.slug]);
    }

    return { id: post.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  await requireAdmin();

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบบทความ" };

  await prisma.post.delete({ where: { id } });
  revalidateAll(existing.kind, [existing.slug]);
  return {};
}

export async function togglePostStatus(id: string): Promise<{ error?: string }> {
  await requireAdmin();

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

  revalidateAll(existing.kind, [existing.slug]);
  return {};
}
