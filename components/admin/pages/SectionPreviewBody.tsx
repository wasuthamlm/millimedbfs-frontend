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
          แถบนี้ไม่แสดงผลจริง — ระบบแสดงแถบ &quot;สมัครสมาชิก / เข้าสู่ระบบ&quot; แบบ global อยู่แล้วทุกหน้า (ตั้งค่าที่ส่วนหัวเว็บไซต์)
        </div>
      );
    case "company-intro":
      return (
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-6">
          {section.titleTh ? (
            <h3 className="text-center text-xl font-bold text-slate-900">{section.titleTh}</h3>
          ) : (
            <p className="text-center text-xl font-medium text-slate-300">พิมพ์หัวข้อที่นี่...</p>
          )}
          {section.imageUrl && (
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
          )}
          {section.bodyTh ? (
            <BlockBodyText text={section.bodyTh} className="text-sm text-slate-600" />
          ) : (
            <p className="text-sm text-slate-400">ยังไม่มีเนื้อหา — คลิกเพื่อแก้ไขในแผงด้านขวา</p>
          )}
        </div>
      );
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
