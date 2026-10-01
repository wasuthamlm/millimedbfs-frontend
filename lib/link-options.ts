import "server-only";
import { prisma } from "@/lib/prisma";

export type LinkOption = { label: string; value: string };

/** Link suggestions for admin link fields — real pages, product categories and article types (legacy LinkSuggestInput). */
export async function getLinkOptions(): Promise<LinkOption[]> {
  const [pages, productCats, articleCats] = await Promise.all([
    prisma.page.findMany({ where: { deletedAt: null }, select: { slug: true, titleTh: true }, orderBy: { titleTh: "asc" } }),
    prisma.productCategory.findMany({ select: { slug: true, nameTh: true }, orderBy: { order: "asc" } }),
    prisma.articleCategory.findMany({ select: { slug: true, nameTh: true }, orderBy: { order: "asc" } }),
  ]);
  const options: LinkOption[] = [
    { label: "หน้าแรก", value: "/" },
    { label: "สินค้าทั้งหมด", value: "/products" },
    { label: "ข่าวสารทั้งหมด", value: "/news" },
    { label: "ติดต่อเรา", value: "/contact" },
    ...pages.map((p) => ({ label: p.titleTh || p.slug, value: p.slug === "home" ? "/" : `/${p.slug}` })),
    ...productCats.map((c) => ({ label: `สินค้า: ${c.nameTh}`, value: `/products/${c.slug}` })),
    ...articleCats.map((c) => ({ label: `ข่าว: ${c.nameTh}`, value: `/news/${c.slug}` })),
  ];
  return options.filter((o, i) => options.findIndex((x) => x.value === o.value) === i);
}
