import type { Media, Post } from "@/lib/generated/prisma/client";

const FALLBACK_IMAGE = "/images/articles/cold-water-sore-throat.svg";

export type PostWithCover = Post & { coverImage: Media | null };

export type ArticleView = {
  slug: string;
  title: string;
  image: string;
  publishedAt: string;
  category?: string;
};

export type NewsView = {
  slug: string;
  title: string;
  excerpt?: string;
  image: string;
  publishedAt: string;
  featured?: boolean;
};

export function toArticleView(post: PostWithCover): ArticleView {
  return {
    slug: post.slug,
    title: post.titleTh,
    image: post.coverImage?.url ?? FALLBACK_IMAGE,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    category: post.category ?? undefined,
  };
}

export function toNewsView(post: PostWithCover): NewsView {
  return {
    slug: post.slug,
    title: post.titleTh,
    excerpt: post.excerptTh ?? undefined,
    image: post.coverImage?.url ?? FALLBACK_IMAGE,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    featured: post.featured,
  };
}
