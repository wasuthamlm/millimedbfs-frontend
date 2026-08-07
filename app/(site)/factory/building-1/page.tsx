import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata: Metadata = {
  title: "อาคารโรงงาน 1",
  alternates: { canonical: "/factory/building-1" },
};

export default function FactoryBuilding1Page() {
  return <PlaceholderPage title="อาคารโรงงาน 1" />;
}
