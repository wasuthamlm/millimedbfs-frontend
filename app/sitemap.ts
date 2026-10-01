import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { postPath, productPath } from "@/lib/public-urls";
import { getEnabledLocales } from "@/lib/i18n/enabled-locales";
import { localeInfo, localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/about",
  "/factory",
  "/factory/building-1",
  "/factory/building-2",
  "/standards",
  "/products",
  "/news",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const [posts, products, productCategories, articleCategories, landings] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, seoNoIndex: false },
      include: { articleCategory: { select: { slug: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", deletedAt: null, seoNoIndex: false },
      include: { category: { select: { slug: true } } },
    }),
    prisma.productCategory.findMany({ where: { active: true, status: "PUBLISHED" }, select: { slug: true } }),
    prisma.articleCategory.findMany({ where: { active: true, status: "PUBLISHED" }, select: { slug: true } }),
    prisma.landingPage.findMany({ where: { status: "PUBLISHED", deletedAt: null, noIndex: false }, select: { slug: true, updatedAt: true } }),
  ]);

  const locales = await getEnabledLocales();
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED", archived: false, deletedAt: null, seoNoIndex: false, slug: { not: "home" } },
    select: { slug: true, updatedAt: true },
  });

  const entries: { path: string; lastModified?: Date }[] = [
    ...staticRoutes.map((path) => ({ path: path || "/", lastModified: new Date() })),
    ...pages.filter((p) => !staticRoutes.includes(`/${p.slug}`)).map((p) => ({ path: `/${p.slug}`, lastModified: p.updatedAt })),
    ...productCategories.map((c) => ({ path: `/products/${encodeURIComponent(c.slug)}` })),
    ...articleCategories.map((c) => ({ path: `/news/${encodeURIComponent(c.slug)}` })),
    ...posts.map((post) => ({ path: postPath(post), lastModified: post.updatedAt })),
    ...products.map((product) => ({ path: productPath(product), lastModified: product.updatedAt })),
    ...landings.map((l) => ({ path: `/lp/${encodeURIComponent(l.slug)}`, lastModified: l.updatedAt })),
  ];

  // One entry per URL (Thai, unprefixed) with hreflang alternates for every enabled language.
  return entries.map(({ path, lastModified }) => ({
    url: `${base}${localePath("th", path)}`,
    ...(lastModified ? { lastModified } : {}),
    alternates: {
      languages: Object.fromEntries([
        ...locales.map((code) => [localeInfo(code).hreflang, `${base}${localePath(code, path)}`]),
        ["x-default", `${base}${localePath("th", path)}`],
      ]),
    },
  }));
}
