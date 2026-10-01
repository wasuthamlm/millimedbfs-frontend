import type { Metadata } from "next";
import { CmsPageOrPlaceholder, cmsPageMetadata } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/factory">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata(locale, "factory", { title: "อาคารโรงงาน", description: "ข้อมูลอาคารโรงงานผลิตของ Millimed BFS" });
}

export default async function FactoryPage({ params }: PageProps<"/[locale]/factory">) {
  const { locale } = await params;
  return <CmsPageOrPlaceholder locale={locale} slug="factory" title="อาคารโรงงาน" />;
}
