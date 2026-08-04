import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsFeatured } from "@/components/news/NewsFeatured";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsView } from "@/lib/post-view";

export function LatestNews({
  title = "ข่าวสารล่าสุด",
  items,
}: {
  title?: string;
  items: NewsView[];
}) {
  const [featured, ...secondary] = items;

  return (
    <section className="py-14 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading title={title} viewAllHref="/news" />
        <div className="grid gap-6 lg:grid-cols-2">
          {featured && <NewsFeatured item={featured} />}
          <div className="flex flex-col gap-4">
            {secondary.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
