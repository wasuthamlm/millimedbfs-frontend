import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toArticleView, toNewsView } from "@/lib/post-view";
import { PageSectionsRenderer } from "@/components/site/PageSectionsRenderer";

export const dynamic = "force-dynamic";

async function getPage(slug: string) {
  return prisma.page.findFirst({
    where: { slug, status: "PUBLISHED", archived: false },
    include: { sections: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: segments } = await params;
  const slug = segments.join("/");
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.titleTh,
    description: page.seoDesc || undefined,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;
  const slug = segments.join("/");

  const page = await getPage(slug);
  if (!page) notFound();

  if (page.sections.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{page.titleTh}</h1>
        <p className="mt-3 text-slate-500">หน้านี้กำลังจะมาเร็ว ๆ นี้</p>
      </div>
    );
  }

  const needsNews = page.sections.some((s) => s.type === "LATEST_NEWS");
  const needsArticles = page.sections.some((s) => s.type === "ARTICLES");
  const needsBanners = page.sections.some((s) => s.type === "HERO_BANNERS");
  const newsTake = page.sections.find((s) => s.type === "LATEST_NEWS")?.itemsToShow ?? 3;
  const articlesTake = page.sections.find((s) => s.type === "ARTICLES")?.itemsToShow ?? 8;

  const [newsPosts, articlePosts, bannerRows, bannerConfig] = await Promise.all([
    needsNews
      ? prisma.post.findMany({
          where: { kind: "NEWS", status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: { coverImage: true },
          take: newsTake,
        })
      : Promise.resolve([]),
    needsArticles
      ? prisma.post.findMany({
          where: { kind: "ARTICLE", status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: { coverImage: true },
          take: articlesTake,
        })
      : Promise.resolve([]),
    needsBanners
      ? prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" }, include: { image: true } })
      : Promise.resolve([]),
    needsBanners ? prisma.siteBannerConfig.findUnique({ where: { id: "singleton" } }) : Promise.resolve(null),
  ]);

  const newsItems = newsPosts.map(toNewsView);
  const articleItems = articlePosts.map(toArticleView);
  const bannerItems = bannerRows
    .filter((b) => b.image)
    .map((b) => ({ id: b.id, titleTh: b.titleTh, image: b.image!.url, link: b.link }));

  return (
    <PageSectionsRenderer
      sections={page.sections}
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
