import Image from "next/image";
import { PromoBar } from "@/components/layout/PromoBar";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import type { PageSection } from "@/data/admin-pages";
import { banners } from "@/data/admin-banners";

export function SectionPreviewBody({ section }: { section: PageSection }) {
  switch (section.type) {
    case "hero-banners": {
      const active = banners.find((b) => b.active);
      if (!active) {
        return (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 text-sm text-slate-400">
            ยังไม่มี Banner ที่เปิดใช้งาน
          </div>
        );
      }
      return (
        <div className="relative h-48 w-full sm:h-64">
          <Image src={active.image} alt={active.titleTh} fill className="object-cover" />
        </div>
      );
    }
    case "cta-bar":
      return <PromoBar />;
    case "company-intro":
      return (
        <div className="flex h-24 items-center justify-center text-sm text-slate-400">
          — ยังไม่มีเนื้อหา — กด &ldquo;แก้ไข&rdquo; เพื่อเพิ่ม
        </div>
      );
    case "latest-news":
      return <LatestNews />;
    case "articles":
      return <ArticlesGrid />;
    default:
      return null;
  }
}
