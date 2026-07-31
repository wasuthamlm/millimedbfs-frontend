import type { MetadataRoute } from "next";
import { newsItems } from "@/data/news";
import { articles } from "@/data/articles";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://millimedbfs.com";

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...newsItems.map((item) => ({
      url: `${base}/news/${item.slug}`,
      lastModified: new Date(item.publishedAt),
    })),
    ...articles.map((article) => ({
      url: `${base}/articles/${article.slug}`,
      lastModified: new Date(article.publishedAt),
    })),
  ];
}
