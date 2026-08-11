import type { Metadata } from "next";
import { CmsPageOrPlaceholder } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "อาคารโรงงาน 2",
  alternates: { canonical: "/factory/building-2" },
};

export default function FactoryBuilding2Page() {
  return <CmsPageOrPlaceholder slug="factory/building-2" title="อาคารโรงงาน 2" />;
}
