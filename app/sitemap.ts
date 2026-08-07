import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/about",
  "/factory",
  "/factory/building-1",
  "/factory/building-2",
  "/standards",
  "/products",
  "/products/eye-care",
  "/products/skin-care",
  "/news",
  "/articles",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const [posts, products] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED" } }),
    prisma.product.findMany({ where: { status: "ACTIVE" } }),
  ]);

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${base}/${post.kind === "NEWS" ? "news" : "articles"}/${post.slug}`,
      lastModified: post.publishedAt ?? post.createdAt,
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.id}`,
      lastModified: product.updatedAt,
    })),
  ];
}
