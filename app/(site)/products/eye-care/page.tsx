import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "ผลิตภัณฑ์ดูแลดวงตา",
  alternates: { canonical: "/products/eye-care" },
};

export default function EyeCarePage() {
  return <PlaceholderPage title="ผลิตภัณฑ์ดูแลดวงตา" />;
}
