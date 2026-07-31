import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { articles } from "@/data/articles";

export const metadata: Metadata = {
  title: "บทความ",
  description: "บทความน่ารู้ด้านสุขภาพและความงามจาก Millimed BFS",
};

export default function ArticlesPage() {
  return (
    <Container className="flex flex-col gap-8 py-14 sm:py-20">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">บทความ</h1>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Container>
  );
}
