import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "มาตรฐานผู้ผลิต",
  description: "มาตรฐานการผลิตของ Millimed BFS",
  alternates: { canonical: "/standards" },
};

export default function StandardsPage() {
  return <PlaceholderPage title="มาตรฐานผู้ผลิต" />;
}
