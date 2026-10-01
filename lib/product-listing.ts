import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { UiKey } from "@/lib/i18n/ui";
import { PRODUCT_CARD_SELECT } from "@/components/products/ProductGrid";

// Public product listing (legacy ProductsPage): search, price range, 5 sort
// orders — driven by URL query params so results are shareable and crawlable.

export const PRODUCTS_PAGE_SIZE = 12;

export const PRICE_RANGES: { key: string; label: UiKey; min: number; max: number }[] = [
  { key: "all", label: "priceAll", min: 0, max: Infinity },
  { key: "under500", label: "priceUnder500", min: 0, max: 500 },
  { key: "500-1000", label: "price500to1000", min: 500, max: 1000 },
  { key: "1000-2000", label: "price1000to2000", min: 1000, max: 2000 },
  { key: "over2000", label: "priceOver2000", min: 2000, max: Infinity },
];

export const SORT_OPTIONS: { key: string; label: UiKey }[] = [
  { key: "default", label: "sortRecommended" },
  { key: "name_asc", label: "sortNameAsc" },
  { key: "name_desc", label: "sortNameDesc" },
  { key: "price_asc", label: "sortPriceAsc" },
  { key: "price_desc", label: "sortPriceDesc" },
];

export type ListingParams = { q: string; price: string; sort: string; page: number };

type RawParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseListingParams(sp: RawParams): ListingParams {
  const price = one(sp.price);
  const sort = one(sp.sort);
  return {
    q: one(sp.q).trim().slice(0, 100),
    price: PRICE_RANGES.some((r) => r.key === price) ? price : "all",
    sort: SORT_OPTIONS.some((o) => o.key === sort) ? sort : "default",
    page: Math.max(1, Math.floor(Number(one(sp.page))) || 1),
  };
}

/** Query-string for the listing, leaving out defaults (so the canonical URL stays clean). */
export function listingQuery(params: Partial<ListingParams>): Record<string, string | undefined> {
  return {
    q: params.q || undefined,
    price: params.price && params.price !== "all" ? params.price : undefined,
    sort: params.sort && params.sort !== "default" ? params.sort : undefined,
  };
}

const PRODUCT_LISTING_SELECT = PRODUCT_CARD_SELECT;

export async function queryProducts(opts: ListingParams & { categoryIds?: string[] }) {
  const range = PRICE_RANGES.find((r) => r.key === opts.price) ?? PRICE_RANGES[0];
  const and: Prisma.ProductWhereInput[] = [{ status: "ACTIVE", deletedAt: null }];
  if (opts.categoryIds?.length) {
    and.push({ OR: [{ categoryId: { in: opts.categoryIds } }, { subCategoryId: { in: opts.categoryIds } }] });
  }
  if (opts.q) {
    const contains = { contains: opts.q, mode: "insensitive" as const };
    // Translated names count too, so a visitor on /zh can search in Chinese.
    const translated = await prisma.translation.findMany({
      where: { entityType: "PRODUCT", field: "name", value: contains },
      select: { entityId: true },
    });
    and.push({
      OR: [
        { nameTh: contains },
        { nameEn: contains },
        { sku: contains },
        { shortDescTh: contains },
        ...(translated.length ? [{ id: { in: translated.map((t) => t.entityId) } }] : []),
      ],
    });
  }
  if (range.key !== "all") {
    // Products without a price stay visible under every price filter (legacy behaviour).
    and.push({
      OR: [
        { price: null },
        { price: 0 },
        { price: { gte: range.min, ...(Number.isFinite(range.max) ? { lt: range.max } : {}) } },
      ],
    });
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    opts.sort === "name_asc"
      ? [{ nameTh: "asc" }]
      : opts.sort === "name_desc"
        ? [{ nameTh: "desc" }]
        : opts.sort === "price_asc"
          ? [{ price: { sort: "asc", nulls: "last" } }]
          : opts.sort === "price_desc"
            ? [{ price: { sort: "desc", nulls: "last" } }]
            : [{ bestSeller: "desc" }, { order: "asc" }, { updatedAt: "desc" }];

  const where: Prisma.ProductWhereInput = { AND: and };
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (opts.page - 1) * PRODUCTS_PAGE_SIZE,
      take: PRODUCTS_PAGE_SIZE,
      select: PRODUCT_LISTING_SELECT,
    }),
  ]);
  return { total, products, totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE)) };
}

/** The category plus every descendant — a parent's page lists its sub-categories' products too. */
export async function categoryTreeIds(rootId: string): Promise<string[]> {
  const all = await prisma.productCategory.findMany({ select: { id: true, parentId: true } });
  const ids = [rootId];
  for (let i = 0; i < ids.length; i++) for (const c of all) if (c.parentId === ids[i]) ids.push(c.id);
  return ids;
}
