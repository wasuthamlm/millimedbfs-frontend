import type { Metadata } from "next";
import { CmsPageOrPlaceholder, cmsPageMetadata } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/factory/building-1">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata(locale, "factory/building-1", { title: "อาคารโรงงาน 1" });
}

export default async function FactoryBuilding1Page({ params }: PageProps<"/[locale]/factory/building-1">) {
  const { locale } = await params;
  return <CmsPageOrPlaceholder locale={locale} slug="factory/building-1" title="อาคารโรงงาน 1" />;
}
