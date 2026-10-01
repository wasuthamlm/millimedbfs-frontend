import type { Metadata } from "next";
import { CmsPageOrPlaceholder, cmsPageMetadata } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/factory/building-2">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata(locale, "factory/building-2", { title: "อาคารโรงงาน 2" });
}

export default async function FactoryBuilding2Page({ params }: PageProps<"/[locale]/factory/building-2">) {
  const { locale } = await params;
  return <CmsPageOrPlaceholder locale={locale} slug="factory/building-2" title="อาคารโรงงาน 2" />;
}
