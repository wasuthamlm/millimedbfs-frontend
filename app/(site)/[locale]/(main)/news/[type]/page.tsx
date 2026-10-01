import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PostListing } from "@/components/news/PostListing";
import { prisma } from "@/lib/prisma";
import { decodeParam, postPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";

export async function generateMetadata({ params }: PageProps<"/[locale]/news/[type]">): Promise<Metadata> {
  const { locale, type: rawType } = await params;
  const category = await prisma.articleCategory.findUnique({ where: { slug: decodeParam(rawType) } });
  if (!category) return {};
  const t = await loadLocalizer(locale, [["ARTICLE_CATEGORY", [category.id]]]);
  return {
    title: t("ARTICLE_CATEGORY", category.id, "name", category.nameTh, category.nameEn),
    description: t("ARTICLE_CATEGORY", category.id, "description", category.descriptionTh, category.descriptionEn) || undefined,
    alternates: await localeAlternates(locale, `/news/${encodeURIComponent(category.slug)}`),
  };
}

export default async function NewsTypePage({ params, searchParams }: PageProps<"/[locale]/news/[type]">) {
  const { locale, type: rawType } = await params;
  const { page } = await searchParams;
  const type = decodeParam(rawType);

  const category = await prisma.articleCategory.findUnique({ where: { slug: type } });
  if (category?.active && category.status === "PUBLISHED") {
    return <PostListing locale={locale} typeSlug={category.slug} page={Math.max(1, Number(page) || 1)} />;
  }

  // Old /news/<post-slug> URLs (before posts moved under their type).
  const post = await prisma.post.findUnique({
    where: { slug: type },
    select: { slug: true, kind: true, status: true, articleCategory: { select: { slug: true } } },
  });
  if (post?.status === "PUBLISHED") permanentRedirect(localePath(locale, postPath(post)));

  notFound();
}
