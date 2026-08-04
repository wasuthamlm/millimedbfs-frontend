import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

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
  const base = "https://millimedbfs.com";
  const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" } });

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${base}/${post.kind === "NEWS" ? "news" : "articles"}/${post.slug}`,
      lastModified: post.publishedAt ?? post.createdAt,
    })),
  ];
}
