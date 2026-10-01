import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsFeatured } from "@/components/news/NewsFeatured";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsView } from "@/lib/post-view";
import { localePath } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui";

export function LatestNews({
  title,
  items,
  locale = "th",
}: {
  title?: string;
  items: NewsView[];
  locale?: string;
}) {
  const [featured, ...secondary] = items;

  return (
    <section className="py-14 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading title={title || ui(locale, "latestNews")} viewAllHref={localePath(locale, "/news")} locale={locale} />
        <div className="grid gap-6 lg:grid-cols-2">
          {featured && <NewsFeatured item={featured} />}
          <div className="flex flex-col gap-4">
            {secondary.map((item) => (
              <NewsCard key={item.slug} item={item} locale={locale} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
