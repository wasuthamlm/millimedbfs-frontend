import type { Metadata } from "next";
import { PostListing } from "@/components/news/PostListing";
import { localeAlternates } from "@/lib/i18n/alternates";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata({ params }: PageProps<"/[locale]/news">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: ui(locale, "newsAndArticles"),
    description: ui(locale, "newsDesc"),
    alternates: await localeAlternates(locale, "/news"),
  };
}

export default async function NewsPage({ params, searchParams }: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  const { page } = await searchParams;
  return <PostListing locale={locale} page={Math.max(1, Number(page) || 1)} />;
}
