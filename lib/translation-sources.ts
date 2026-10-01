import "server-only";
import { prisma } from "@/lib/prisma";
import { parseConfig } from "@/lib/sections";

// What /admin/translations can bulk-translate: each entity's Thai source fields,
// keyed by the Translation field name that lib/i18n/localize.ts reads back.

export type TranslatableType =
  | "ARTICLE"
  | "PRODUCT"
  | "PAGE"
  | "PAGE_SECTION"
  | "NAV_LINK"
  | "PRODUCT_CATEGORY"
  | "ARTICLE_CATEGORY";

export const TRANSLATABLE_TYPES: { type: TranslatableType; label: string }[] = [
  { type: "ARTICLE", label: "บทความ / ข่าว" },
  { type: "PRODUCT", label: "สินค้า" },
  { type: "PAGE", label: "หน้าเว็บ (ชื่อและ SEO)" },
  { type: "PAGE_SECTION", label: "บล็อกเนื้อหาในหน้าเว็บ / Landing" },
  { type: "NAV_LINK", label: "เมนูเว็บไซต์" },
  { type: "PRODUCT_CATEGORY", label: "หมวดหมู่สินค้า" },
  { type: "ARTICLE_CATEGORY", label: "ประเภทบทความ" },
];

export function isTranslatableType(v: string): v is TranslatableType {
  return TRANSLATABLE_TYPES.some((t) => t.type === v);
}

/** Ids of every item of this type that should be translated (not trashed). */
export async function translatableIds(type: TranslatableType): Promise<string[]> {
  const pick = (rows: { id: string }[]) => rows.map((r) => r.id);
  switch (type) {
    case "ARTICLE":
      return pick(await prisma.post.findMany({ where: { deletedAt: null }, select: { id: true } }));
    case "PRODUCT":
      return pick(await prisma.product.findMany({ where: { deletedAt: null }, select: { id: true } }));
    case "PAGE":
      return pick(await prisma.page.findMany({ where: { deletedAt: null, archived: false }, select: { id: true } }));
    case "PAGE_SECTION":
      return pick(
        await prisma.pageSection.findMany({
          where: { OR: [{ page: { deletedAt: null, archived: false } }, { landingPage: { deletedAt: null } }] },
          select: { id: true },
        }),
      );
    case "NAV_LINK":
      return pick(await prisma.navLink.findMany({ where: { active: true }, select: { id: true } }));
    case "PRODUCT_CATEGORY":
      return pick(await prisma.productCategory.findMany({ select: { id: true } }));
    case "ARTICLE_CATEGORY":
      return pick(await prisma.articleCategory.findMany({ select: { id: true } }));
  }
}

/** Thai source text for one item; empty fields are left out so nothing blank gets stored. */
export async function sourceFields(type: TranslatableType, id: string): Promise<Record<string, string> | null> {
  let fields: Record<string, string | null | undefined> | null = null;
  switch (type) {
    case "ARTICLE": {
      const p = await prisma.post.findUnique({ where: { id } });
      if (p) fields = { title: p.titleTh, excerpt: p.excerptTh, body: p.bodyTh, seoTitle: p.seoTitle, seoDesc: p.seoDesc };
      break;
    }
    case "PRODUCT": {
      const p = await prisma.product.findUnique({ where: { id } });
      if (p) fields = { name: p.nameTh, shortDesc: p.shortDescTh, description: p.descriptionTh, seoTitle: p.seoTitle, seoDesc: p.seoDesc };
      break;
    }
    case "PAGE": {
      const p = await prisma.page.findUnique({ where: { id } });
      if (p) fields = { title: p.titleTh, seoTitle: p.seoTitle, seoDesc: p.seoDesc, ogTitle: p.ogTitle, ogDesc: p.ogDesc };
      break;
    }
    case "PAGE_SECTION": {
      const s = await prisma.pageSection.findUnique({ where: { id } });
      if (s) fields = { title: s.titleTh, body: parseConfig(s.config).bodyTh };
      break;
    }
    case "NAV_LINK": {
      const n = await prisma.navLink.findUnique({ where: { id } });
      if (n) fields = { label: n.labelTh };
      break;
    }
    case "PRODUCT_CATEGORY": {
      const c = await prisma.productCategory.findUnique({ where: { id } });
      if (c) fields = { name: c.nameTh, description: c.descriptionTh };
      break;
    }
    case "ARTICLE_CATEGORY": {
      const c = await prisma.articleCategory.findUnique({ where: { id } });
      if (c) fields = { name: c.nameTh, description: c.descriptionTh };
      break;
    }
  }
  if (!fields) return null;
  return Object.fromEntries(Object.entries(fields).filter((e): e is [string, string] => typeof e[1] === "string" && e[1].trim() !== ""));
}
