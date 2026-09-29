import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { postPath, productPath } from "@/lib/public-urls";

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
  const [posts, products, productCategories, articleCategories] = await Promise.all([
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
  ]);

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...productCategories.map((c) => ({ url: `${base}/products/${encodeURIComponent(c.slug)}` })),
    ...articleCategories.map((c) => ({ url: `${base}/news/${encodeURIComponent(c.slug)}` })),
    ...posts.map((post) => ({
      url: `${base}${postPath(post)}`,
      lastModified: post.updatedAt,
    })),
    ...products.map((product) => ({
      url: `${base}${productPath(product)}`,
      lastModified: product.updatedAt,
    })),
  ];
}
