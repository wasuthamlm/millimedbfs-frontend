import type { Metadata } from "next";
import { CmsPageOrPlaceholder } from "@/components/site/CmsPageOrPlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ผลิตภัณฑ์ดูแลดวงตา",
  alternates: { canonical: "/products/eye-care" },
};

export default function EyeCarePage() {
  return <CmsPageOrPlaceholder slug="products/eye-care" title="ผลิตภัณฑ์ดูแลดวงตา" />;
}
