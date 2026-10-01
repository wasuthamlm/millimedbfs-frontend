import type { Metadata } from "next";
import { CmsPageOrPlaceholder, cmsPageMetadata } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/standards">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata(locale, "standards", { title: "มาตรฐานผู้ผลิต", description: "มาตรฐานการผลิตของ Millimed BFS" });
}

export default async function StandardsPage({ params }: PageProps<"/[locale]/standards">) {
  const { locale } = await params;
  return <CmsPageOrPlaceholder locale={locale} slug="standards" title="มาตรฐานผู้ผลิต" />;
}
