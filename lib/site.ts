import type { Metadata } from "next";

export const SITE_URL = "https://millimedbfs.com";
export const SITE_NAME = "Millimed BFS";

/**
 * Next.js merges nested Metadata fields (like openGraph) by full replacement,
 * not deep merge — a page that sets its own `openGraph` loses the parent
 * layout's type/locale/siteName unless it repeats them. Route through this
 * helper wherever a page needs page-specific openGraph fields (usually
 * `images`) so those defaults stay consistent everywhere.
 */
export function buildOpenGraph(overrides: NonNullable<Metadata["openGraph"]>): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "th_TH",
    siteName: SITE_NAME,
    ...overrides,
  };
}

/**
 * Same rationale as buildOpenGraph: Next.js does not derive `twitter` tags
 * from `openGraph`, and replaces (not merges) nested Metadata fields, so
 * pages that set page-specific twitter fields must repeat the defaults.
 */
export function buildTwitter(overrides: NonNullable<Metadata["twitter"]> = {}): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    ...overrides,
  };
}

/** Builds a schema.org BreadcrumbList JSON-LD object for a detail page's trail. */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
