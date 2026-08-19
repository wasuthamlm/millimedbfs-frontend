import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { toNewsView } from "@/lib/post-view";
import { formatThaiDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// The `params.slug` the page component receives can still be percent-encoded
// (e.g. "%E0%B8%9C..." instead of "ผิว...") even though the same param is
// already decoded when read inside generateMetadata for the same request.
// Decoding defensively here keeps both call sites matching the raw DB slug.
function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

async function getNewsPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { coverImage: true },
  });
  if (!post || post.kind !== "NEWS" || post.status !== "PUBLISHED") return null;
  return post;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { kind: "NEWS", status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const post = await getNewsPost(slug);
  if (!post) return {};
  const item = toNewsView(post);
  const title = post.seoTitle || item.title;
  const description = post.seoDesc || item.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/news/${slug}` },
    openGraph: buildOpenGraph({ type: "article", title, description, images: [item.image] }),
    ...(post.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = decodeSlug((await params).slug);
  const post = await getNewsPost(slug);
  if (!post) notFound();
  const item = toNewsView(post);
  const absoluteImage = item.image.startsWith("http") ? item.image : `${SITE_URL}${item.image}`;

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    image: [absoluteImage],
    datePublished: item.publishedAt,
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Millimed BFS" },
    mainEntityOfPage: `${SITE_URL}/news/${slug}`,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "ข่าวสาร", path: "/news" },
    { name: item.title, path: `/news/${slug}` },
  ]);

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Link href="/news" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-gold-dark">
        ← กลับ
      </Link>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <Image src={item.image} alt={item.title} fill sizes="(min-width: 1280px) 1280px, 100vw" className="object-cover" priority />
      </div>
      <p className="text-sm text-slate-400">{formatThaiDate(item.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.title}</h1>
      {item.excerpt && (
        <p className="text-base leading-relaxed text-slate-600">{item.excerpt}</p>
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
