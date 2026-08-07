import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toArticleView, toNewsView } from "@/lib/post-view";
import { PageSectionsRenderer } from "@/components/site/PageSectionsRenderer";
import type { SectionType } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: "home" } });
  return {
    title: page?.seoTitle || page?.titleTh || undefined,
    description: page?.seoDesc || undefined,
    alternates: { canonical: "/" },
  };
}

const DEFAULT_SECTIONS = [
  { id: "default-hero", type: "HERO_BANNERS" as SectionType },
  { id: "default-news", type: "LATEST_NEWS" as SectionType },
  { id: "default-articles", type: "ARTICLES" as SectionType },
].map((s, i) => ({
  ...s,
  order: i,
  titleTh: "",
  titleEn: null,
  visibleDesktop: true,
  visibleTablet: true,
  visibleMobile: true,
  columns: null,
  itemsToShow: null,
  config: null,
}));

export default async function Home() {
  const page = await prisma.page.findUnique({
    where: { slug: "home" },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  // Fallback to hardcoded defaults if the "home" page hasn't been configured
  // in the DB yet (e.g. fresh install before seeding), so the homepage never
  // renders blank.
  const sections = page && page.sections.length > 0 ? page.sections : DEFAULT_SECTIONS;

  const latestNewsSection = sections.find((s) => s.type === "LATEST_NEWS");
  const articlesSection = sections.find((s) => s.type === "ARTICLES");
  const newsTake = latestNewsSection?.itemsToShow ?? 3;
  const articlesTake = articlesSection?.itemsToShow ?? 8;

  const [newsPosts, articlePosts, bannerRows, bannerConfig] = await Promise.all([
    prisma.post.findMany({
      where: { kind: "NEWS", status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { coverImage: true },
      take: newsTake,
    }),
    prisma.post.findMany({
      where: { kind: "ARTICLE", status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { coverImage: true },
      take: articlesTake,
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { image: true },
    }),
    prisma.siteBannerConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  const newsItems = newsPosts.map(toNewsView);
  const articleItems = articlePosts.map(toArticleView);
  const bannerItems = bannerRows
    .filter((b) => b.image)
    .map((b) => ({ id: b.id, titleTh: b.titleTh, image: b.image!.url, link: b.link }));

  return (
    <PageSectionsRenderer
      sections={sections}
      newsItems={newsItems}
      articleItems={articleItems}
      bannerItems={bannerItems}
      bannerConfig={
        bannerConfig
          ? {
              transitionEffect: bannerConfig.transitionEffect,
              direction: bannerConfig.direction,
              transitionSpeedMs: bannerConfig.transitionSpeedMs,
              displayDurationMs: bannerConfig.displayDurationMs,
              autoplay: bannerConfig.autoplay,
              loop: bannerConfig.loop,
              pauseOnHover: bannerConfig.pauseOnHover,
              showArrows: bannerConfig.showArrows,
              showDots: bannerConfig.showDots,
            }
          : undefined
      }
    />
  );
}
