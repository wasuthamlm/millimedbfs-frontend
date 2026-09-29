import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Pager } from "@/components/admin/Pager";
import { prisma } from "@/lib/prisma";
import { POST_CARD_INCLUDE, toArticleView } from "@/lib/post-view";
import { localePath } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

/**
 * /news and /news/:type — every published post (news + articles), with a tab
 * per article type. Ported from the legacy NewsPage.
 */
export async function PostListing({
  locale,
  typeSlug,
  page,
}: {
  locale: string;
  typeSlug?: string;
  page: number;
}) {
  const types = await prisma.articleCategory.findMany({
    where: { active: true, status: "PUBLISHED", posts: { some: { status: "PUBLISHED", deletedAt: null } } },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, nameTh: true },
  });
  const activeType = typeSlug ? types.find((t) => t.slug === typeSlug) : undefined;

  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    ...(activeType ? { categoryId: activeType.id } : {}),
  };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: POST_CARD_INCLUDE,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = localePath(locale, activeType ? `/news/${encodeURIComponent(activeType.slug)}` : "/news");

  const tabClass = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
      active ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
    );

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{activeType?.nameTh ?? "ข่าวสารและบทความ"}</h1>
      {types.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="ประเภทบทความ">
          <Link href={localePath(locale, "/news")} className={tabClass(!activeType)}>
            ทั้งหมด
          </Link>
          {types.map((t) => (
            <Link
              key={t.id}
              href={localePath(locale, `/news/${encodeURIComponent(t.slug)}`)}
              className={tabClass(activeType?.id === t.id)}
            >
              {t.nameTh}
            </Link>
          ))}
        </nav>
      )}
      {posts.length === 0 ? (
        <p className="py-16 text-center text-slate-400">ยังไม่มีบทความ</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {posts.map((post) => {
            const view = toArticleView(post);
            return <ArticleCard key={post.id} article={{ ...view, href: localePath(locale, view.href) }} />;
          })}
        </div>
      )}
      <Pager page={page} totalPages={totalPages} basePath={basePath} />
    </Container>
  );
}
