import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { POST_CARD_INCLUDE, toArticleView } from "@/lib/post-view";
import { formatThaiDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";
import { decodeParam, postPath, postTypeSlug } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

type Params = { locale: string; type: string; slug: string };

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { ...POST_CARD_INCLUDE, articleCategory: { select: { slug: true, nameTh: true } } },
  });
  if (!post || post.status !== "PUBLISHED" || post.deletedAt) return null;
  return post;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const post = await getPost(decodeParam(rawSlug));
  if (!post) return {};
  const view = toArticleView(post);
  const title = post.seoTitle || view.title;
  const description = post.seoDesc || post.excerptTh || undefined;
  return {
    title,
    description,
    alternates: { canonical: post.canonicalUrl || postPath(post) },
    openGraph: buildOpenGraph({
      type: "article",
      title: post.ogTitle || title,
      description: post.ogDesc || description,
      images: [post.ogImageUrl || view.image],
    }),
    ...(post.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function PostDetailPage({ params }: { params: Promise<Params> }) {
  const { locale, type, slug: rawSlug } = await params;
  const post = await getPost(decodeParam(rawSlug));
  if (!post) notFound();

  // One canonical URL per post: a wrong/legacy type segment redirects.
  if (decodeParam(type) !== postTypeSlug(post)) {
    permanentRedirect(localePath(locale, postPath(post)));
  }

  const view = toArticleView(post);
  const path = postPath(post);
  const absoluteImage = view.image.startsWith("http") ? view.image : `${SITE_URL}${view.image}`;
  const typePath = `/news/${encodeURIComponent(postTypeSlug(post))}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": post.kind === "NEWS" ? "NewsArticle" : "Article",
    headline: view.title,
    image: [absoluteImage],
    datePublished: view.publishedAt,
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Millimed BFS" },
    mainEntityOfPage: `${SITE_URL}${path}`,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "ข่าวสารและบทความ", path: "/news" },
    ...(post.articleCategory ? [{ name: post.articleCategory.nameTh, path: typePath }] : []),
    { name: view.title, path },
  ]);

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Link
        href={localePath(locale, typePath)}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
      >
        ← กลับ
      </Link>
      <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-2xl">
        <Image src={view.image} alt={view.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
      </div>
      {post.articleCategory && (
        <span className="w-fit rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-medium text-brand-navy">
          {post.articleCategory.nameTh}
        </span>
      )}
      <p className="text-sm text-slate-400">{formatThaiDate(view.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{view.title}</h1>
      {post.kind === "NEWS" && post.excerptTh && (
        <p className="text-base leading-relaxed text-slate-600">{post.excerptTh}</p>
      )}
      {post.bodyTh && (
        <div
          className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-navy"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.bodyTh) }}
        />
      )}
    </Container>
  );
}
