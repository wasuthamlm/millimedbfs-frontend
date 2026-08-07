import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsCard } from "@/components/news/NewsCard";
import { prisma } from "@/lib/prisma";
import { toNewsView } from "@/lib/post-view";

export const metadata: Metadata = {
  title: "ข่าวสาร",
  description: "ข่าวสารและกิจกรรมล่าสุดจาก Millimed BFS",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const posts = await prisma.post.findMany({
    where: { kind: "NEWS", status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { coverImage: true },
  });
  const newsItems = posts.map(toNewsView);

  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">ข่าวสาร</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {newsItems.map((item) => (
          <NewsCard key={item.slug} item={item} />
        ))}
      </div>
    </Container>
  );
}
