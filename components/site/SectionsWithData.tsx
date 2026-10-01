import { prisma } from "@/lib/prisma";
import { loadHeroBanners } from "@/lib/hero-banners";
import { POST_CARD_INCLUDE, toArticleView, toNewsView } from "@/lib/post-view";
import { loadLocalizer } from "@/lib/i18n/localize";
import { PageSectionsRenderer } from "@/components/site/PageSectionsRenderer";

type Sections = Parameters<typeof PageSectionsRenderer>[0]["sections"];

/** Loads the news / article / banner data a set of blocks needs, then renders them. Used by CMS pages and landing pages. */
export async function SectionsWithData({ sections, locale = "th" }: { sections: Sections; locale?: string }) {
  const needsNews = sections.some((s) => s.type === "LATEST_NEWS");
  const needsArticles = sections.some((s) => s.type === "ARTICLES");
  const needsBanners = sections.some((s) => s.type === "HERO_BANNERS");
  const newsTake = sections.find((s) => s.type === "LATEST_NEWS")?.itemsToShow ?? 3;
  const articlesTake = sections.find((s) => s.type === "ARTICLES")?.itemsToShow ?? 8;

  const [newsPosts, articlePosts, hero] = await Promise.all([
    needsNews
      ? prisma.post.findMany({
          where: { kind: "NEWS", status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: POST_CARD_INCLUDE,
          take: newsTake,
        })
      : Promise.resolve([]),
    needsArticles
      ? prisma.post.findMany({
          where: { kind: "ARTICLE", status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: POST_CARD_INCLUDE,
          take: articlesTake,
        })
      : Promise.resolve([]),
    needsBanners ? loadHeroBanners(locale) : Promise.resolve({ items: [], config: undefined }),
  ]);

  const t = await loadLocalizer(locale, [["ARTICLE", [...newsPosts, ...articlePosts].map((p) => p.id)]]);

  return (
    <PageSectionsRenderer
      locale={locale}
      sections={sections}
      newsItems={newsPosts.map((p) => toNewsView(p, t))}
      articleItems={articlePosts.map((p) => toArticleView(p, t))}
      bannerItems={hero.items}
      bannerConfig={hero.config}
    />
  );
}
