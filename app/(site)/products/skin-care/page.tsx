import type { Metadata } from "next";
import { CmsPageOrPlaceholder } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ผลิตภัณฑ์ดูแลผิว",
  alternates: { canonical: "/products/skin-care" },
};

export default function SkinCarePage() {
  return <CmsPageOrPlaceholder slug="products/skin-care" title="ผลิตภัณฑ์ดูแลผิว" />;
}
