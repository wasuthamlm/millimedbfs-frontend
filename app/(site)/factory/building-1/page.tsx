import type { Metadata } from "next";
import { CmsPageOrPlaceholder } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "อาคารโรงงาน 1",
  alternates: { canonical: "/factory/building-1" },
};

export default function FactoryBuilding1Page() {
  return <CmsPageOrPlaceholder slug="factory/building-1" title="อาคารโรงงาน 1" />;
}
