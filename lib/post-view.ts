import type { Media, Post } from "@/lib/generated/prisma/client";
import { postPath } from "@/lib/public-urls";

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

export function toArticleView(post: PostWithCover): ArticleView {
  return {
    slug: post.slug,
    href: postPath(post),
    title: post.titleTh,
    image: post.coverImage?.url ?? FALLBACK_IMAGE,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    category: post.category ?? undefined,
  };
}

export function toNewsView(post: PostWithCover): NewsView {
  return {
    slug: post.slug,
    href: postPath(post),
    title: post.titleTh,
    excerpt: post.excerptTh ?? undefined,
    image: post.coverImage?.url ?? FALLBACK_IMAGE,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    featured: post.featured,
  };
}
