import type { Metadata } from "next";
import { CmsPageOrPlaceholder } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "มาตรฐานผู้ผลิต",
  description: "มาตรฐานการผลิตของ Millimed BFS",
  alternates: { canonical: "/standards" },
};

export default function StandardsPage() {
  return <CmsPageOrPlaceholder slug="standards" title="มาตรฐานผู้ผลิต" />;
}
