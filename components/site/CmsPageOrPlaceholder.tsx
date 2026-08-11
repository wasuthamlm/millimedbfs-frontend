import { prisma } from "@/lib/prisma";
import { toArticleView, toNewsView } from "@/lib/post-view";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";
import { PageSectionsRenderer } from "@/components/site/PageSectionsRenderer";

// Renders a CMS-managed page (Page + PageSection, editable from /admin/pages)
// when one exists for `slug`, otherwise falls back to the "coming soon"
// placeholder. Use this instead of a bare <PlaceholderPage /> for any route
// that also has a fixed URL segment (so it can't go through the [...slug]
// catch-all) — that way content added later in the admin actually shows up,
// instead of being shadowed by a hardcoded placeholder forever.
export async function CmsPageOrPlaceholder({ slug, title }: { slug: string; title: string }) {
  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED", archived: false },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  if (!page || page.sections.length === 0) {
    return <PlaceholderPage title={title} />;
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

  return (
    <PageSectionsRenderer
      sections={page.sections}
      newsItems={newsPosts.map(toNewsView)}
      articleItems={articlePosts.map(toArticleView)}
      bannerItems={bannerRows
        .filter((b) => b.image)
        .map((b) => ({ id: b.id, titleTh: b.titleTh, altText: b.altTextTh, image: b.image!.url, link: b.link }))}
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
