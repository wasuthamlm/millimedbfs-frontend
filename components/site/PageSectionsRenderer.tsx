import Image from "next/image";
import { HeroBanners, type HeroBannerItem, type HeroBannerConfig } from "@/components/home/HeroBanners";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { BlockBodyText } from "@/components/site/BlockBodyText";
import type { NewsView, ArticleView } from "@/lib/post-view";
import type { SectionType } from "@/lib/generated/prisma/client";

type SectionRow = {
  id: string;
  order: number;
  type: SectionType;
  titleTh: string;
  titleEn: string | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
  columns: number | null;
  itemsToShow: number | null;
  config: unknown;
};

function visibilityClass(section: SectionRow) {
  return [
    section.visibleMobile ? "block" : "hidden",
    section.visibleTablet ? "md:block" : "md:hidden",
    section.visibleDesktop ? "lg:block" : "lg:hidden",
  ].join(" ");
}

export function PageSectionsRenderer({
  sections,
  newsItems,
  articleItems,
  bannerItems,
  bannerConfig,
}: {
  sections: SectionRow[];
  newsItems: NewsView[];
  articleItems: ArticleView[];
  bannerItems: HeroBannerItem[];
  bannerConfig?: HeroBannerConfig;
}) {
  return (
    <>
      {sections.map((section) => {
        const config = (section.config as { anchorId?: string; bodyTh?: string; imageUrl?: string } | null) ?? {};

        switch (section.type) {
          case "HERO_BANNERS":
            return (
              <div key={section.id} id={config.anchorId || undefined} className={visibilityClass(section)}>
                <HeroBanners banners={bannerItems} config={bannerConfig} />
              </div>
            );
          case "CTA_BAR":
            // The global promo bar (สมัครสมาชิก / เข้าสู่ระบบ) was removed from
            // app/(site)/layout.tsx. This section type is kept for backward
            // compatibility with existing saved pages but intentionally no-ops.
            return null;
          case "LATEST_NEWS":
            return (
              <div key={section.id} id={config.anchorId || undefined} className={visibilityClass(section)}>
                <LatestNews title={section.titleTh || undefined} items={newsItems.slice(0, section.itemsToShow ?? 3)} />
              </div>
            );
          case "ARTICLES":
            return (
              <div key={section.id} id={config.anchorId || undefined} className={visibilityClass(section)}>
                <ArticlesGrid
                  title={section.titleTh || undefined}
                  items={articleItems.slice(0, section.itemsToShow ?? 8)}
                  columns={section.columns ?? undefined}
                />
              </div>
            );
          case "COMPANY_INTRO":
          case "CUSTOM":
          default:
            if (!section.titleTh && !config.bodyTh && !config.imageUrl) return null;
            return (
              <div
                key={section.id}
                id={config.anchorId || undefined}
                className={`mx-auto max-w-4xl px-4 py-12 ${visibilityClass(section)}`}
              >
                {section.titleTh && (
                  <h2 className="mb-4 text-center text-2xl font-bold text-slate-900">{section.titleTh}</h2>
                )}
                {config.imageUrl && (
                  <div className="relative mb-4 w-full overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={config.imageUrl}
                      alt={section.titleTh}
                      width={1600}
                      height={1000}
                      unoptimized
                      className="h-auto w-full object-contain"
                    />
                  </div>
                )}
                {config.bodyTh && (
                  <BlockBodyText text={config.bodyTh} className="text-base leading-relaxed text-slate-600" />
                )}
              </div>
            );
        }
      })}
    </>
  );
}
