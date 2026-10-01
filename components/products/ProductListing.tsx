import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/site/PageHero";
import { Pager } from "@/components/admin/Pager";
import { SearchIcon } from "@/components/ui/admin-icons";
import { ProductGrid } from "@/components/products/ProductGrid";
import { AutoSubmitSelect } from "@/components/products/AutoSubmitSelect";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { ui, uiFormat } from "@/lib/i18n/ui";
import { PRICE_RANGES, SORT_OPTIONS, listingQuery, queryProducts, type ListingParams } from "@/lib/product-listing";

const chipClass = (active: boolean) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active ? "bg-brand-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-navy/40",
  );

function withQuery(path: string, query: Record<string, string | undefined>) {
  const qs = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => !!e[1])).toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Product listing with category tabs, search, price filter, sort and paging
 * (legacy ProductsPage). All state lives in the URL query string.
 */
export async function ProductListing({
  locale,
  params,
  title,
  subtitle,
  heroPage,
  activeCategory,
  activeRootId,
  categoryIds,
}: {
  locale: string;
  params: ListingParams;
  title: string;
  subtitle?: string | null;
  heroPage?: { heroStyle: string | null; heroAlignment: string | null } | null;
  activeCategory?: { id: string; slug: string } | null;
  /** Top-level category whose tab is highlighted (the active category or its ancestor). */
  activeRootId?: string | null;
  categoryIds?: string[];
}) {
  const [{ products, total, totalPages }, categories] = await Promise.all([
    queryProducts({ ...params, categoryIds }),
    prisma.productCategory.findMany({
      where: { active: true, status: "PUBLISHED", parentId: null },
      orderBy: { order: "asc" },
      select: { id: true, slug: true, nameTh: true, nameEn: true },
    }),
  ]);
  const t = await loadLocalizer(locale, [["PRODUCT_CATEGORY", categories.map((c) => c.id)]]);

  const path = localePath(locale, activeCategory ? `/products/${encodeURIComponent(activeCategory.slug)}` : "/products");
  const query = listingQuery(params);
  const filtered = !!(params.q || params.price !== "all");
  const inputClass = "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy";

  return (
    <>
      <PageHero title={title} subtitle={subtitle} page={heroPage} />
      <Container className="flex flex-col gap-6 py-8 sm:py-12">
        {categories.length > 1 && (
          <nav className="flex flex-wrap gap-2" aria-label={ui(locale, "products")}>
            <Link href={withQuery(localePath(locale, "/products"), query)} className={chipClass(!activeCategory)}>
              {ui(locale, "allCategories")}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={withQuery(localePath(locale, `/products/${encodeURIComponent(c.slug)}`), query)}
                className={chipClass(activeRootId === c.id)}
              >
                {t("PRODUCT_CATEGORY", c.id, "name", c.nameTh, c.nameEn)}
              </Link>
            ))}
          </nav>
        )}

        <form action={path} className="flex flex-wrap gap-2 sm:gap-3" role="search">
          <div className="relative w-full sm:flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q}
              placeholder={ui(locale, "searchProducts")}
              aria-label={ui(locale, "searchProducts")}
              className={cn(inputClass, "w-full pl-9")}
            />
          </div>
          {params.price !== "all" && <input type="hidden" name="price" value={params.price} />}
          <AutoSubmitSelect
            name="sort"
            defaultValue={params.sort}
            ariaLabel={ui(locale, "sortBy")}
            options={SORT_OPTIONS.map((o) => ({ value: o.key, label: ui(locale, o.label) }))}
            className={cn(inputClass, "min-w-0 flex-1 sm:flex-none")}
          />
          <button type="submit" className="h-10 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-navy-hover">
            {ui(locale, "search")}
          </button>
        </form>

        <div className="flex flex-col gap-3 rounded-2xl bg-site-bg p-4 sm:p-5">
          <p className="text-sm font-semibold text-slate-700">{ui(locale, "filterByPrice")}</p>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((r) => (
              <Link key={r.key} href={withQuery(path, { ...query, price: r.key === "all" ? undefined : r.key })} className={chipClass(params.price === r.key)}>
                {ui(locale, r.label)}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-400">{uiFormat(locale, "itemsCount", { n: total })}</p>

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-400">
            <p>{ui(locale, filtered ? "noProductsFound" : "noProducts")}</p>
            {filtered && (
              <Link href={path} className="text-sm text-brand-navy underline">
                {ui(locale, "clearSearch")}
              </Link>
            )}
          </div>
        ) : (
          <ProductGrid products={products} locale={locale} />
        )}

        <Pager page={Math.min(params.page, totalPages)} totalPages={totalPages} basePath={path} extraParams={query} locale={locale} />
      </Container>
    </>
  );
}
