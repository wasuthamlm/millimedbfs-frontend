"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { canDo } from "@/lib/admin-roles";

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
  const session = await requirePermission("page.create");

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;
  // Contributors can edit but never publish — their saves always land as draft.
  if (!canDo(session.user.role, "page.publish")) data.status = "DRAFT";

  try {
    const page = await prisma.page.create({
      data: {
        status: data.status,
        slug: data.slug,
        titleTh: data.titleTh,
        titleEn: data.titleEn || null,
      },
    });

    await logActivity(session.user, "create", "Page", { targetId: page.id, targetLabel: page.titleTh });

    revalidatePath("/admin/pages");
    revalidateSite();
    return { slug: page.slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "สลักนี้ถูกใช้แล้ว กรุณาเลือกสลักอื่น" };
    }
    throw err;
  }
}

export async function setPageStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  const session = await requirePermission("page.publish");
  await prisma.page.update({ where: { id }, data: { status } });
  await logActivity(session.user, (status === "PUBLISHED" ? "publish" : "unpublish"), "Page", { targetId: id });
  revalidatePath("/admin/pages");
  revalidateSite();
  return {};
}

export type PageSeoInput = {
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
  ogTitle: string;
  ogTitleEn: string;
  ogDesc: string;
  ogDescEn: string;
  ogImageUrl: string;
  canonicalUrl: string;
  /** Raw JSON-LD object (as text); "" clears it */
  schemaCustom: string;
  marketingEligible: boolean;
  /** "" = site default, "none" = hide the page header band, or a hero mode */
  heroStyle: string;
  heroAlignment: string;
};

export async function setPageSeo(id: string, input: PageSeoInput): Promise<{ error?: string }> {
  const session = await requirePermission("page.edit");
  let schemaCustom: Prisma.InputJsonValue | typeof Prisma.DbNull = Prisma.DbNull;
  if (input.schemaCustom.trim()) {
    try {
      const parsed = JSON.parse(input.schemaCustom);
      if (!parsed || typeof parsed !== "object") throw new Error();
      schemaCustom = parsed;
    } catch {
      return { error: "Custom JSON-LD ไม่ใช่ JSON ที่ถูกต้อง" };
    }
  }
  if (input.canonicalUrl && !/^https:\/\//.test(input.canonicalUrl)) return { error: "Canonical URL ต้องขึ้นต้นด้วย https://" };
  const nullable = (v: string) => v.trim() || null;
  await prisma.page.update({
    where: { id },
    data: {
      seoTitle: nullable(input.seoTitle),
      seoDesc: nullable(input.seoDesc),
      seoTitleEn: nullable(input.seoTitleEn),
      seoDescEn: nullable(input.seoDescEn),
      seoNoIndex: input.seoNoIndex,
      ogTitle: nullable(input.ogTitle),
      ogTitleEn: nullable(input.ogTitleEn),
      ogDesc: nullable(input.ogDesc),
      ogDescEn: nullable(input.ogDescEn),
      ogImageUrl: nullable(input.ogImageUrl),
      canonicalUrl: nullable(input.canonicalUrl),
      schemaCustom,
      marketingEligible: input.marketingEligible,
      heroStyle: nullable(input.heroStyle),
      heroAlignment: nullable(input.heroAlignment),
    },
  });
  await logActivity(session.user, "update", "Page", { targetId: id, changedFields: ["seo"] });
  revalidatePath("/admin/pages");
  revalidateSite();
  return {};
}

export async function archivePages(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("page.delete");
  if (ids.length === 0) return {};
  await prisma.page.updateMany({ where: { id: { in: ids } }, data: { archived: true } });
  await logActivity(session.user, "trash", "Page", { details: `${ids.length} หน้า` });
  revalidatePath("/admin/pages");
  revalidateSite();
  return {};
}

export async function restorePages(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("page.delete");
  if (ids.length === 0) return {};
  await prisma.page.updateMany({ where: { id: { in: ids } }, data: { archived: false } });
  await logActivity(session.user, "restore", "Page", { details: `${ids.length} หน้า` });
  revalidatePath("/admin/pages");
  revalidateSite();
  return {};
}

export async function deletePage(id: string): Promise<{ error?: string }> {
  const session = await requirePermission("page.delete");

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบหน้านี้" };

  await prisma.page.delete({ where: { id } });
  await logActivity(session.user, "delete", "Page", { targetId: id, targetLabel: existing.titleTh });
  revalidatePath("/admin/pages");
  revalidateSite();
  return {};
}

export async function setPagesStatus(ids: string[], status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  const session = await requirePermission("page.publish");
  if (ids.length === 0) return {};
  await prisma.page.updateMany({ where: { id: { in: ids } }, data: { status } });
  await logActivity(session.user, status === "PUBLISHED" ? "publish" : "unpublish", "Page", { details: `${ids.length} หน้า` });
  revalidatePath("/admin/pages");
  revalidateSite();
  return {};
}

/** Permanently deletes every page in the trash. */
export async function emptyPageTrash(): Promise<{ error?: string }> {
  const session = await requirePermission("page.delete");
  const { count } = await prisma.page.deleteMany({ where: { archived: true } });
  await logActivity(session.user, "delete", "Page", { details: `ล้างถังขยะ ${count} หน้า` });
  revalidatePath("/admin/pages");
  return {};
}

/** Copies a page and all its blocks as a new draft (legacy duplicatePage.js). */
export async function duplicatePage(id: string): Promise<{ error?: string; slug?: string }> {
  const session = await requirePermission("page.create");
  const source = await prisma.page.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } });
  if (!source) return { error: "ไม่พบหน้านี้" };

  let slug = `${source.slug}-copy`;
  for (let n = 2; await prisma.page.count({ where: { slug } }); n++) slug = `${source.slug}-copy-${n}`;

  const { id: _id, createdAt: _c, updatedAt: _u, sections, ...rest } = source;
  void _id;
  void _c;
  void _u;
  const copy = await prisma.page.create({
    data: {
      ...rest,
      slug,
      titleTh: `${source.titleTh} (สำเนา)`,
      status: "DRAFT",
      archived: false,
      schemaCustom: source.schemaCustom ?? Prisma.DbNull,
      sections: {
        create: sections.map(({ id: _sid, pageId: _pid, landingPageId: _lid, config, ...s }) => {
          void _sid;
          void _pid;
          void _lid;
          return { ...s, config: config ?? Prisma.DbNull };
        }),
      },
    },
  });
  await logActivity(session.user, "create", "Page", { targetId: copy.id, targetLabel: copy.titleTh, details: `สำเนาจาก ${source.slug}` });
  revalidatePath("/admin/pages");
  return { slug: copy.slug };
}
