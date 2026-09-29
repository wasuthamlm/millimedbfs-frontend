import type { Metadata } from "next";
import { PostListing } from "@/components/news/PostListing";

export const metadata: Metadata = {
  title: "ข่าวสารและบทความ",
  description: "ข่าวสาร กิจกรรม และบทความน่ารู้ด้านสุขภาพจาก Millimed BFS",
  alternates: { canonical: "/news" },
};

export default async function NewsPage({ params, searchParams }: PageProps<"/[locale]/news">) {
  const { locale } = await params;
  const { page } = await searchParams;
  return <PostListing locale={locale} page={Math.max(1, Number(page) || 1)} />;
}
