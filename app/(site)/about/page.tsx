import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "เรียนรู้เพิ่มเติมเกี่ยวกับ Millimed BFS",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <PlaceholderPage title="เกี่ยวกับเรา" />;
}
