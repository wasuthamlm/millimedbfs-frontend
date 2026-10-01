import type { Media, Post } from "@/lib/generated/prisma/client";
import { postPath } from "@/lib/public-urls";
import type { Localizer } from "@/lib/i18n/localize";

const FALLBACK_IMAGE = "/images/articles/cold-water-sore-throat.svg";

// Include `articleCategory: { select: { slug: true } }` when querying so hrefs
// point at the canonical /news/:type/:slug URL without an extra redirect hop.
export type PostWithCover = Post & { coverImage: Media | null; articleCategory?: { slug: string } | null };

export const POST_CARD_INCLUDE = {
  coverImage: true,
  articleCategory: { select: { slug: true } },
} as const;

export type ArticleView = {
  slug: string;
  href: string;
  title: string;
  image: string;
  publishedAt: string;
  category?: string;
};

export type NewsView = {
  slug: string;
  href: string;
  title: string;
  excerpt?: string;
  image: string;
  publishedAt: string;
  featured?: boolean;
};

// Pass a Localizer (lib/i18n/localize) to get titles/excerpts in the visitor's language.
export function toArticleView(post: PostWithCover, t?: Localizer): ArticleView {
  return {
    slug: post.slug,
    href: postPath(post),
    title: t ? t("ARTICLE", post.id, "title", post.titleTh, post.titleEn) : post.titleTh,
    image: post.coverImage?.url ?? FALLBACK_IMAGE,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    category: post.category ?? undefined,
  };
}

export function toNewsView(post: PostWithCover, t?: Localizer): NewsView {
  return {
    slug: post.slug,
    href: postPath(post),
    title: t ? t("ARTICLE", post.id, "title", post.titleTh, post.titleEn) : post.titleTh,
    excerpt: (t ? t("ARTICLE", post.id, "excerpt", post.excerptTh, post.excerptEn) : post.excerptTh) || undefined,
    image: post.coverImage?.url ?? FALLBACK_IMAGE,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    featured: post.featured,
  };
}
