import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { toArticleView } from "@/lib/post-view";
import { formatThaiDate } from "@/lib/utils";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";

async function getArticle(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { coverImage: true },
  });
  if (!post || post.kind !== "ARTICLE" || post.status !== "PUBLISHED") return null;
  return post;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { kind: "ARTICLE", status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return {};
  const article = toArticleView(post);
  const title = post.seoTitle || article.title;
  const description = post.seoDesc || post.excerptTh || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: buildOpenGraph({ type: "article", title, description, images: [article.image] }),
    ...(post.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();
  const article = toArticleView(post);
  const absoluteImage = article.image.startsWith("http") ? article.image : `${SITE_URL}${article.image}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    image: [absoluteImage],
    datePublished: article.publishedAt,
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Millimed BFS" },
    mainEntityOfPage: `${SITE_URL}/articles/${slug}`,
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "บทความ", path: "/articles" },
    { name: article.title, path: `/articles/${slug}` },
  ]);

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-2xl">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
      </div>
      {article.category && (
        <span className="w-fit rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-medium text-brand-navy">
          {article.category}
        </span>
      )}
      <p className="text-sm text-slate-400">{formatThaiDate(article.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{article.title}</h1>
      {post.bodyTh && (
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
          {post.bodyTh}
        </p>
      )}
    </Container>
  );
}
