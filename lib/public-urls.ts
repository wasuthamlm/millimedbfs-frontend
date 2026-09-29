/**
 * Canonical public URLs for products and posts. These match the legacy site
 * (/products/:category/:slug and /news/:type/:slug) so existing links and
 * search rankings carry over. Paths are locale-less; wrap with localePath().
 */

// Legacy fallback when a product has no category (see DataSection.jsx in the old site).
const FALLBACK_PRODUCT_CATEGORY = "health";

type ProductUrlInput = {
  slug: string | null;
  sku: string;
  category?: { slug: string } | null;
};

export function productCategorySlug(product: Pick<ProductUrlInput, "category">): string {
  return product.category?.slug || FALLBACK_PRODUCT_CATEGORY;
}

export function productPath(product: ProductUrlInput): string {
  return `/products/${encodeURIComponent(productCategorySlug(product))}/${encodeURIComponent(product.slug || product.sku)}`;
}

type PostUrlInput = {
  slug: string;
  kind: "ARTICLE" | "NEWS";
  articleCategory?: { slug: string } | null;
};

/** The article-type slug a post lives under; uncategorised posts fall back by kind. */
export function postTypeSlug(post: Omit<PostUrlInput, "slug">): string {
  return post.articleCategory?.slug || (post.kind === "NEWS" ? "new-and-event" : "article");
}

export function postPath(post: PostUrlInput): string {
  return `/news/${encodeURIComponent(postTypeSlug(post))}/${encodeURIComponent(post.slug)}`;
}

/**
 * Route params can arrive percent-encoded (e.g. Thai slugs) even though the
 * same param is decoded in generateMetadata — decode defensively so lookups
 * match the raw DB value.
 */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
