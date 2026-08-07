import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "ผลิตภัณฑ์ดูแลผิว",
  alternates: { canonical: "/products/skin-care" },
};

export default function SkinCarePage() {
  return <PlaceholderPage title="ผลิตภัณฑ์ดูแลผิว" />;
}
