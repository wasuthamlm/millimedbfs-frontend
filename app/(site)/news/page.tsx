import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsCard } from "@/components/news/NewsCard";
import { newsItems } from "@/data/news";

export const metadata: Metadata = {
  title: "ข่าวสาร",
  description: "ข่าวสารและกิจกรรมล่าสุดจาก Millimed BFS",
};

export default function NewsPage() {
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
