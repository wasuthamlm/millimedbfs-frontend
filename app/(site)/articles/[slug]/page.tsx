import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { articles } from "@/data/articles";
import { formatThaiDate } from "@/lib/utils";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    openGraph: { images: [article.image] },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
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
    </Container>
  );
}
