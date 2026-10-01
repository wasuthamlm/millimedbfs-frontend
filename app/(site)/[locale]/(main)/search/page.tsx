import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { SearchIcon } from "@/components/ui/admin-icons";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ProductGrid } from "@/components/products/ProductGrid";
import { prisma } from "@/lib/prisma";
import { POST_CARD_INCLUDE, toArticleView } from "@/lib/post-view";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { ui, uiFormat } from "@/lib/i18n/ui";
import { listingQuery, queryProducts } from "@/lib/product-listing";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/search">;

const RESULT_LIMIT = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Search result pages are thin/duplicate content — keep them out of the index.
  return { title: ui(locale, "searchResults"), robots: { index: false, follow: true } };
}

/** Site search (header search icon, WebSite SearchAction): products, articles and pages. */
export default async function SearchPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) ?? "";

  let products: Awaited<ReturnType<typeof queryProducts>>["products"] = [];
  let productTotal = 0;
  let posts: Awaited<ReturnType<typeof searchPosts>> = [];
  let pages: Awaited<ReturnType<typeof searchPages>> = [];
  if (q) {
    const [productResult, postRows, pageRows] = await Promise.all([
      queryProducts({ q, price: "all", sort: "default", page: 1 }),
      searchPosts(q),
      searchPages(q),
    ]);
    products = productResult.products;
    productTotal = productResult.total;
    posts = postRows;
    pages = pageRows;
  }
  const t = await loadLocalizer(locale, [
    ["ARTICLE", posts.map((p) => p.id)],
    ["PAGE", pages.map((p) => p.id)],
  ]);
  const nothing = q && products.length === 0 && posts.length === 0 && pages.length === 0;
  const heading = "text-xl font-bold text-slate-900";

  return (
    <>
      <PageHero title={q ? uiFormat(locale, "searchResultsFor", { q }) : ui(locale, "searchResults")} />
      <Container className="flex flex-col gap-10 py-8 sm:py-12">
        <form action={localePath(locale, "/search")} role="search" className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              autoFocus={!q}
              placeholder={ui(locale, "searchPlaceholder")}
              aria-label={ui(locale, "search")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <button type="submit" className="h-11 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-navy-hover">
            {ui(locale, "search")}
          </button>
        </form>

        {!q && <p className="py-10 text-center text-slate-400">{ui(locale, "searchHint")}</p>}
        {nothing && <p className="py-10 text-center text-slate-400">{ui(locale, "searchNothing")}</p>}

        {products.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className={heading}>
                {ui(locale, "products")} <span className="text-sm font-normal text-slate-400">({productTotal})</span>
              </h2>
              {productTotal > products.length && (
                <Link
                  href={`${localePath(locale, "/products")}?${new URLSearchParams(listingQuery({ q }) as Record<string, string>).toString()}`}
                  className="text-sm font-medium text-brand-navy hover:underline"
                >
                  {ui(locale, "readAll")} →
                </Link>
              )}
            </div>
            <ProductGrid products={products} locale={locale} />
          </section>
        )}

        {posts.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className={heading}>{ui(locale, "newsAndArticles")}</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {posts.map((p) => {
                const v = toArticleView(p, t);
                return <ArticleCard key={p.id} article={{ ...v, href: localePath(locale, v.href) }} />;
              })}
            </div>
          </section>
        )}

        {pages.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className={heading}>{ui(locale, "pages")}</h2>
            <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
              {pages.map((p) => (
                <li key={p.id}>
                  <Link href={localePath(locale, p.slug === "home" ? "/" : `/${p.slug}`)} className="flex flex-col gap-0.5 px-5 py-4 hover:bg-slate-50">
                    <span className="font-medium text-slate-800">{t("PAGE", p.id, "title", p.titleTh, p.titleEn)}</span>
                    {p.seoDesc && <span className="line-clamp-1 text-sm text-slate-500">{t("PAGE", p.id, "seoDesc", p.seoDesc, p.seoDescEn)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}

async function searchPosts(q: string) {
  const contains = { contains: q, mode: "insensitive" as const };
  const translated = await prisma.translation.findMany({
    where: { entityType: "ARTICLE", field: { in: ["title", "excerpt"] }, value: contains },
    select: { entityId: true },
  });
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      OR: [
        { titleTh: contains },
        { titleEn: contains },
        { excerptTh: contains },
        { excerptEn: contains },
        { focusKeyword: contains },
        ...(translated.length ? [{ id: { in: translated.map((t) => t.entityId) } }] : []),
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: RESULT_LIMIT,
    include: POST_CARD_INCLUDE,
  });
}

async function searchPages(q: string) {
  const contains = { contains: q, mode: "insensitive" as const };
  return prisma.page.findMany({
    where: {
      status: "PUBLISHED",
      archived: false,
      deletedAt: null,
      seoNoIndex: false,
      OR: [{ titleTh: contains }, { titleEn: contains }, { seoTitle: contains }, { seoDesc: contains }],
    },
    take: RESULT_LIMIT,
    select: { id: true, slug: true, titleTh: true, titleEn: true, seoDesc: true, seoDescEn: true },
  });
}
