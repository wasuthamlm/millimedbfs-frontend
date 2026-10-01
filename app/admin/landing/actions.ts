"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";
import { logActivity } from "@/lib/activity-log";
import { sanitizeHtml } from "@/lib/sanitize";
import { buildSectionRows } from "@/lib/section-rows";
import type { PageSection } from "@/lib/sections";
import {
  DEFAULT_LANDING_FOOTER,
  DEFAULT_LANDING_HEADER,
  DEFAULT_LANDING_WIDGET,
  landingSlugify,
  parseLandingFaq,
  parseLandingFooter,
  parseLandingHeader,
  parseLandingWidget,
  type LandingFaqItem,
  type LandingFooterConfig,
  type LandingHeaderConfig,
  type LandingWidgetConfig,
} from "@/lib/landing";
import { isLocaleCode } from "@/lib/i18n/locales";

type Result = { error?: string };

function revalidateLanding(slug?: string) {
  revalidatePath("/admin/landing");
  if (slug) revalidatePath(`/[locale]/lp/${slug}`, "page");
}

async function slugTaken(slug: string, exceptId?: string) {
  const row = await prisma.landingPage.findUnique({ where: { slug }, select: { id: true } });
  return !!row && row.id !== exceptId;
}

export async function createLandingPage(input: { titleTh: string; slug: string }): Promise<Result & { id?: string }> {
  const session = await requirePermission("page.create");
  const titleTh = input.titleTh.trim().slice(0, 200);
  const slug = landingSlugify(input.slug || input.titleTh);
  if (!titleTh) return { error: "กรุณาใส่ชื่อหน้า" };
  if (!slug) return { error: "กรุณาใส่ slug ที่ถูกต้อง" };
  if (await slugTaken(slug)) return { error: "slug นี้ถูกใช้แล้ว" };

  const page = await prisma.landingPage.create({
    data: {
      slug,
      titleTh,
      status: "DRAFT",
      useSiteColors: true,
      headerConfig: { ...DEFAULT_LANDING_HEADER, logoText: titleTh } as Prisma.InputJsonValue,
      footerConfig: { ...DEFAULT_LANDING_FOOTER, copyright: `© ${new Date().getFullYear()} ${titleTh}` } as Prisma.InputJsonValue,
      widgetConfig: DEFAULT_LANDING_WIDGET as Prisma.InputJsonValue,
    },
  });
  await logActivity(session.user, "create", "LandingPage", { targetId: page.id, targetLabel: titleTh });
  revalidateLanding();
  return { id: page.id };
}

const hexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/);
const opt = (max: number) => z.string().max(max).optional().default("");

const landingInputSchema = z.object({
  titleTh: z.string().trim().min(1, "กรุณาใส่ชื่อหน้า").max(200),
  titleEn: opt(200),
  slug: z.string().max(80),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  coverImageUrl: opt(1000),
  useSiteColors: z.boolean(),
  primaryColor: hexColor,
  accentColor: hexColor,
  bgColor: hexColor,
  textColor: hexColor,
  seoTitle: opt(200),
  seoTitleEn: opt(200),
  seoDesc: opt(500),
  seoDescEn: opt(500),
  ogTitle: opt(200),
  ogTitleEn: opt(200),
  ogDesc: opt(500),
  ogDescEn: opt(500),
  ogImageUrl: opt(1000),
  focusKeyword: opt(200),
  canonicalUrl: opt(1000),
  noIndex: z.boolean(),
  geoPlaceName: opt(200),
  geoAddress: opt(500),
  geoLatitude: opt(40),
  geoLongitude: opt(40),
  marketingEligible: z.boolean(),
});

export type LandingInput = z.input<typeof landingInputSchema> & {
  header: LandingHeaderConfig;
  footer: LandingFooterConfig;
  widget: LandingWidgetConfig;
  faq: LandingFaqItem[];
};

const nullIfEmpty = (v: string) => (v.trim() ? v.trim() : null);

/** Saves the landing page settings and replaces its blocks in one go. */
export async function saveLandingPage(id: string, input: LandingInput, sections: PageSection[]): Promise<Result & { status?: "DRAFT" | "PUBLISHED" }> {
  const session = await requirePermission("page.edit");
  const parsed = landingInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const d = parsed.data;

  const existing = await prisma.landingPage.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return { error: "ไม่พบ Landing Page" };

  const slug = landingSlugify(d.slug) || existing.slug;
  if (isLocaleCode(slug)) return { error: "slug ซ้ำกับรหัสภาษา กรุณาใช้ชื่ออื่น" };
  if (slug !== existing.slug && (await slugTaken(slug, id))) return { error: "slug นี้ถูกใช้แล้ว" };

  // Without the publish right a page can't change its published state (legacy: contributors save drafts).
  const status = canDo(session.user.role, "page.publish") ? d.status : existing.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const built = buildSectionRows(sections);
  if ("error" in built) return { error: built.error };

  const footer = parseLandingFooter(input.footer);
  footer.text = sanitizeHtml(footer.text);
  const json = (v: unknown) => v as Prisma.InputJsonValue;

  await prisma.$transaction(async (tx) => {
    await tx.landingPage.update({
      where: { id },
      data: {
        slug,
        status,
        titleTh: d.titleTh,
        titleEn: nullIfEmpty(d.titleEn),
        coverImageUrl: nullIfEmpty(d.coverImageUrl),
        useSiteColors: d.useSiteColors,
        primaryColor: d.primaryColor,
        accentColor: d.accentColor,
        bgColor: d.bgColor,
        textColor: d.textColor,
        seoTitle: nullIfEmpty(d.seoTitle),
        seoTitleEn: nullIfEmpty(d.seoTitleEn),
        seoDesc: nullIfEmpty(d.seoDesc),
        seoDescEn: nullIfEmpty(d.seoDescEn),
        ogTitle: nullIfEmpty(d.ogTitle),
        ogTitleEn: nullIfEmpty(d.ogTitleEn),
        ogDesc: nullIfEmpty(d.ogDesc),
        ogDescEn: nullIfEmpty(d.ogDescEn),
        ogImageUrl: nullIfEmpty(d.ogImageUrl),
        focusKeyword: nullIfEmpty(d.focusKeyword),
        canonicalUrl: nullIfEmpty(d.canonicalUrl),
        noIndex: d.noIndex,
        geoPlaceName: nullIfEmpty(d.geoPlaceName),
        geoAddress: nullIfEmpty(d.geoAddress),
        geoLatitude: nullIfEmpty(d.geoLatitude),
        geoLongitude: nullIfEmpty(d.geoLongitude),
        marketingEligible: d.marketingEligible,
        headerConfig: json(parseLandingHeader(input.header)),
        footerConfig: json(footer),
        widgetConfig: json(parseLandingWidget(input.widget)),
        faq: json(parseLandingFaq(input.faq).filter((f) => f.qTh.trim() || f.qEn.trim())),
      },
    });
    await tx.pageSection.deleteMany({ where: { landingPageId: id } });
    await tx.pageSection.createMany({ data: built.rows.map((r) => ({ ...r, landingPageId: id })) });
  });

  const action = status === existing.status ? "update" : status === "PUBLISHED" ? "publish" : "unpublish";
  await logActivity(session.user, action, "LandingPage", {
    targetId: id,
    targetLabel: d.titleTh,
    details: `บันทึก ${sections.length} บล็อก`,
  });
  revalidateLanding(existing.slug);
  if (slug !== existing.slug) revalidateLanding(slug);
  revalidatePath(`/admin/landing/${id}`);
  return { status };
}

export async function renameLandingPage(id: string, titleTh: string): Promise<Result> {
  const session = await requirePermission("page.edit");
  const title = titleTh.trim().slice(0, 200);
  if (!title) return { error: "กรุณาใส่ชื่อหน้า" };
  const page = await prisma.landingPage.update({ where: { id }, data: { titleTh: title } });
  await logActivity(session.user, "update", "LandingPage", { targetId: id, targetLabel: title });
  revalidateLanding(page.slug);
  return {};
}

export async function setLandingStatus(ids: string[], status: "DRAFT" | "PUBLISHED"): Promise<Result> {
  const session = await requirePermission("page.publish");
  if (!ids.length) return {};
  await prisma.landingPage.updateMany({ where: { id: { in: ids }, deletedAt: null }, data: { status } });
  await logActivity(session.user, status === "PUBLISHED" ? "publish" : "unpublish", "LandingPage", { details: `${ids.length} หน้า` });
  revalidateLanding();
  for (const p of await prisma.landingPage.findMany({ where: { id: { in: ids } }, select: { slug: true } })) revalidateLanding(p.slug);
  return {};
}

export async function trashLandingPages(ids: string[]): Promise<Result> {
  const session = await requirePermission("page.delete");
  if (!ids.length) return {};
  const pages = await prisma.landingPage.findMany({ where: { id: { in: ids } }, select: { slug: true, titleTh: true } });
  await prisma.landingPage.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date(), status: "DRAFT" } });
  await logActivity(session.user, "trash", "LandingPage", { targetLabel: pages.map((p) => p.titleTh).join(", ").slice(0, 200) });
  revalidateLanding();
  pages.forEach((p) => revalidateLanding(p.slug));
  return {};
}

export async function restoreLandingPages(ids: string[]): Promise<Result> {
  const session = await requirePermission("page.delete");
  if (!ids.length) return {};
  await prisma.landingPage.updateMany({ where: { id: { in: ids } }, data: { deletedAt: null } });
  await logActivity(session.user, "restore", "LandingPage", { details: `${ids.length} หน้า` });
  revalidateLanding();
  return {};
}

export async function purgeLandingPages(ids: string[]): Promise<Result> {
  const session = await requirePermission("page.delete");
  if (!ids.length) return {};
  // Only pages already in the trash can be deleted for good.
  const { count } = await prisma.landingPage.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "LandingPage", { details: `ลบถาวร ${count} หน้า` });
  revalidateLanding();
  return {};
}

export async function emptyLandingTrash(): Promise<Result> {
  const session = await requirePermission("page.delete");
  const { count } = await prisma.landingPage.deleteMany({ where: { deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "LandingPage", { details: `ล้างถังขยะ ${count} หน้า` });
  revalidateLanding();
  return {};
}
