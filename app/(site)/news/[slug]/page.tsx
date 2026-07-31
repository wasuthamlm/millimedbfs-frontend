import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { newsItems } from "@/data/news";
import { formatThaiDate } from "@/lib/utils";

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: { images: [item.image] },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = newsItems.find((n) => n.slug === slug);
  if (!item) notFound();

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
        <Image src={item.image} alt={item.title} fill className="object-cover" priority />
      </div>
      <p className="text-sm text-slate-400">{formatThaiDate(item.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.title}</h1>
      {item.excerpt && (
        <p className="text-base leading-relaxed text-slate-600">{item.excerpt}</p>
      )}
    </Container>
  );
}
