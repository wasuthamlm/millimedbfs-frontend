import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "อาคารโรงงาน",
  description: "ข้อมูลอาคารโรงงานผลิตของ Millimed BFS",
};

export default function FactoryPage() {
  return <PlaceholderPage title="อาคารโรงงาน" />;
}
