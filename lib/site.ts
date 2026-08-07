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
