import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { prisma } from "@/lib/prisma";
import { toArticleView, toNewsView } from "@/lib/post-view";

export default async function Home() {
  const page = await prisma.page.findUnique({
    where: { slug: "home" },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  const sections = page?.sections ?? [];
  const latestNewsSection = sections.find((s) => s.type === "LATEST_NEWS");
  const articlesSection = sections.find((s) => s.type === "ARTICLES");

  // Fallback to hardcoded defaults if the "home" page hasn't been configured
  // in the DB yet (e.g. fresh install before seeding), so the homepage never
  // renders blank.
  const ordered = sections.length
    ? sections
    : [{ type: "LATEST_NEWS" as const }, { type: "ARTICLES" as const }];

  const newsTake = latestNewsSection?.itemsToShow ?? 3;
  const articlesTake = articlesSection?.itemsToShow ?? 8;

  const [newsPosts, articlePosts] = await Promise.all([
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
  ]);

  const newsItems = newsPosts.map(toNewsView);
  const articleItems = articlePosts.map(toArticleView);

  return (
    <>
      {ordered.map((section, i) => {
        if (section.type === "LATEST_NEWS") {
          return (
            <LatestNews
              key={`latest-news-${i}`}
              title={latestNewsSection?.titleTh}
              items={newsItems}
            />
          );
        }
        if (section.type === "ARTICLES") {
          return (
            <ArticlesGrid
              key={`articles-${i}`}
              title={articlesSection?.titleTh}
              items={articleItems}
              columns={articlesSection?.columns ?? undefined}
            />
          );
        }
        return null;
      })}
    </>
  );
}
