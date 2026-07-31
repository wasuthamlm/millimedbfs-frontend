import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsFeatured } from "@/components/news/NewsFeatured";
import { NewsCard } from "@/components/news/NewsCard";
import { newsItems } from "@/data/news";

export function LatestNews() {
  const [featured, ...rest] = newsItems;
  const secondary = rest.slice(0, 2);

  return (
    <section className="py-14 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading title="ข่าวสารล่าสุด" viewAllHref="/news" />
        <div className="grid gap-6 lg:grid-cols-2">
          <NewsFeatured item={featured} />
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
