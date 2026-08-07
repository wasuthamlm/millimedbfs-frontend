import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { toNewsView } from "@/lib/post-view";
import { formatThaiDate } from "@/lib/utils";
import { buildOpenGraph, SITE_URL } from "@/lib/site";

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
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post) return {};
  const item = toNewsView(post);
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/news/${slug}` },
    openGraph: buildOpenGraph({ type: "article", images: [item.image] }),
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <Image src={item.image} alt={item.title} fill className="object-cover" priority />
      </div>
      <p className="text-sm text-slate-400">{formatThaiDate(item.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.title}</h1>
      {item.excerpt && (
        <p className="text-base leading-relaxed text-slate-600">{item.excerpt}</p>
      )}
      {post.bodyTh && (
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
          {post.bodyTh}
        </p>
      )}
    </Container>
  );
}
