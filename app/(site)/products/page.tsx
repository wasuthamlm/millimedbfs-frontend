import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "สินค้า",
  description: "ผลิตภัณฑ์ของ Millimed BFS",
};

export default function ProductsPage() {
  return <PlaceholderPage title="สินค้า" />;
}
