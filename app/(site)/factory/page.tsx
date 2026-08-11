import type { Metadata } from "next";
import { CmsPageOrPlaceholder } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "อาคารโรงงาน",
  description: "ข้อมูลอาคารโรงงานผลิตของ Millimed BFS",
  alternates: { canonical: "/factory" },
};

export default function FactoryPage() {
  return <CmsPageOrPlaceholder slug="factory" title="อาคารโรงงาน" />;
}
