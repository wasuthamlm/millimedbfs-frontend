import Image from "next/image";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { BlockBodyText } from "@/components/site/BlockBodyText";
import type { PageSection } from "@/data/admin-pages";
import type { ArticleView, NewsView } from "@/lib/post-view";
import { banners } from "@/data/admin-banners";

export function SectionPreviewBody({
  section,
  previewArticles,
  previewNews,
}: {
  section: PageSection;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
}) {
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
      return (
        <div className="flex h-16 items-center justify-center bg-slate-50 text-sm text-slate-400">
          แถบนี้ไม่แสดงผลจริง — บล็อกประเภทนี้ถูกปิดใช้งานถาวรแล้ว (เดิมเคยแสดงแถบ &quot;สมัครสมาชิก / เข้าสู่ระบบ&quot; แบบ global แต่ถูกลบออกจากทุกหน้าแล้ว)
        </div>
      );
    case "company-intro": {
      // Mirrors the live renderer (components/site/PageSectionsRenderer.tsx): a block with
      // an image and columns = 2 lays out image-beside-text, everything else stays stacked.
      const sideBySide = section.columns === 2 && Boolean(section.imageUrl);

      const heading = section.titleTh ? (
        <h3 className={`text-xl font-bold text-slate-900 ${sideBySide ? "text-left" : "text-center"}`}>
          {section.titleTh}
        </h3>
      ) : (
        <p className={`text-xl font-medium text-slate-300 ${sideBySide ? "text-left" : "text-center"}`}>
          พิมพ์หัวข้อที่นี่...
        </p>
      );

      const image = section.imageUrl ? (
        <div className="relative w-full overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={section.imageUrl}
            alt={section.titleTh || ""}
            width={1200}
            height={800}
            unoptimized
            className="h-auto w-full object-contain"
          />
        </div>
      ) : null;

      const body = section.bodyTh ? (
        <BlockBodyText text={section.bodyTh} className="text-sm text-slate-600" />
      ) : (
        <p className="text-sm text-slate-400">ยังไม่มีเนื้อหา — คลิกเพื่อแก้ไขในแผงด้านขวา</p>
      );

      if (sideBySide) {
        return (
          <div className="mx-auto grid max-w-4xl gap-6 px-6 py-6 md:grid-cols-2 md:items-center">
            {image}
            <div className="flex flex-col gap-3">
              {heading}
              {body}
            </div>
          </div>
        );
      }

      return (
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-6">
          {heading}
          {image}
          {body}
        </div>
      );
    }
    case "latest-news":
      return <LatestNews items={previewNews.slice(0, section.itemsToShow ?? 3)} />;
    case "articles":
      return (
        <ArticlesGrid
          items={previewArticles.slice(0, section.itemsToShow ?? 8)}
          columns={section.columns}
        />
      );
    default:
      return null;
  }
}
