import Image from "next/image";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { SectionShell, SectionTitle, RichText } from "@/components/site/sections/SectionShell";
import {
  AboutCards,
  CtaButtonsRow,
  DownloadButton,
  GalleryGrid,
  LayoutColumns,
  TextColumns,
  TextImage,
  VideoEmbed,
} from "@/components/site/sections/blocks";
import { AnchorNav } from "@/components/site/sections/AnchorNav";
import { BLOCK_TYPES, type PageSection } from "@/lib/sections";
import type { ArticleView, NewsView } from "@/lib/post-view";
import { banners } from "@/data/admin-banners";

function Placeholder({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-24 items-center justify-center bg-slate-50 px-6 py-8 text-center text-sm text-slate-400">{children}</div>;
}

/**
 * Editor preview of one block. Uses the same presentational components as the
 * public renderer (components/site/sections) so what admins see matches the site;
 * data-driven blocks show a summary instead of querying.
 */
export function SectionPreviewBody({
  section,
  previewArticles,
  previewNews,
}: {
  section: PageSection;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
}) {
  const config = section.config;
  const title = section.titleTh;
  const light = config.background?.textColor === "light";
  const shell = (children: React.ReactNode) => (
    <SectionShell config={{ ...config, anchorId: undefined }} visibility={{ desktop: true, tablet: true, mobile: true }}>
      {children}
    </SectionShell>
  );

  switch (section.type) {
    case "hero-banners": {
      const actives = banners.filter((b) => b.active);
      const active = actives[0];
      if (!active) return <Placeholder>ยังไม่มี Banner ที่เปิดใช้งาน</Placeholder>;
      return (
        <div className="relative h-48 w-full sm:h-64">
          <Image src={active.image} alt={active.titleTh} fill className="object-cover" />
          {actives.length > 1 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {actives.map((b, i) => (
                <div
                  key={b.id}
                  className={`relative h-8 w-12 overflow-hidden rounded ring-2 ${i === 0 ? "ring-white" : "opacity-50 ring-transparent"}`}
                >
                  <Image src={b.image} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case "cta-bar":
      return <Placeholder>บล็อกประเภทนี้เลิกใช้แล้ว (ไม่แสดงบนหน้าเว็บ)</Placeholder>;
    case "latest-news":
      return <LatestNews title={title || undefined} items={previewNews.slice(0, section.itemsToShow ?? 3)} />;
    case "articles":
      return <ArticlesGrid title={title || undefined} items={previewArticles.slice(0, section.itemsToShow ?? 8)} columns={section.columns} />;
    case "data-articles":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <Placeholder>แสดงบทความ {section.itemsToShow ?? 6} รายการ{config.articleTypeId ? " จากประเภทที่เลือก" : ""}</Placeholder>
        </>,
      );
    case "data-products":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <Placeholder>
            แสดงสินค้า {config.productSort === "manual" ? `${config.productIds?.length ?? 0} รายการที่เลือก` : `${section.itemsToShow ?? 8} รายการ`}
          </Placeholder>
        </>,
      );
    case "text":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          {config.bodyTh ? <RichText html={config.bodyTh} /> : <Placeholder>ยังไม่มีเนื้อหา — คลิกเพื่อแก้ไข</Placeholder>}
        </>,
      );
    case "columns":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <TextColumns html={config.bodyTh} columns={section.columns ?? 2} />
        </>,
      );
    case "text-image":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <TextImage html={config.bodyTh} imageUrl={config.imageUrl} alt={title} position={config.imagePosition} />
        </>,
      );
    case "video":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          {config.videoUrl ? <VideoEmbed url={config.videoUrl} width={config.videoWidth} /> : <Placeholder>ยังไม่ได้ใส่ลิงก์วิดีโอ</Placeholder>}
        </>,
      );
    case "youtube":
      return <Placeholder>วิดีโอ YouTube จากการตั้งค่า</Placeholder>;
    case "gallery":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          {config.galleryUrls?.length ? <GalleryGrid urls={config.galleryUrls} columns={section.columns ?? 3} alt={title} /> : <Placeholder>ยังไม่มีรูป</Placeholder>}
        </>,
      );
    case "cta":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <RichText html={config.bodyTh} />
          <CtaButtonsRow cta={config.cta} align={config.spacing?.textAlign} />
        </>,
      );
    case "layout":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <LayoutColumns columns={config.layoutColumns ?? []} gap={config.layoutGap} align={config.layoutAlign} />
        </>,
      );
    case "download":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <RichText html={config.bodyTh} className="mb-4" />
          {config.fileUrl ? <DownloadButton url={config.fileUrl} label={config.fileLabelTh || "ดาวน์โหลด"} /> : <Placeholder>ยังไม่ได้เลือกไฟล์</Placeholder>}
        </>,
      );
    case "contact-info":
      return <Placeholder>ข้อมูลติดต่อและแผนที่ จากการตั้งค่า</Placeholder>;
    case "anchor-nav":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          {config.navLinks?.length ? (
            <AnchorNav light={light} links={config.navLinks.map((l) => ({ anchorId: l.anchorId, label: l.labelTh || l.anchorId }))} />
          ) : (
            <Placeholder>ยังไม่มีลิงก์ — คลิกเพื่อเพิ่ม</Placeholder>
          )}
        </>,
      );
    case "about-teaser":
      return shell(
        <>
          <SectionTitle title={title} light={light} />
          <RichText html={config.bodyTh} className="mb-6" />
          <AboutCards cards={config.cards ?? []} columns={section.columns ?? 3} />
        </>,
      );
    case "company-intro":
    default: {
      const sideBySide = section.columns === 2 && Boolean(config.imageUrl);
      if (!title && !config.bodyTh && !config.imageUrl) return <Placeholder>{BLOCK_TYPES[section.type]?.label} — คลิกเพื่อแก้ไข</Placeholder>;
      return shell(<TextImage html={`${title ? `<h2>${title.replace(/</g, "&lt;")}</h2>` : ""}${config.bodyTh ?? ""}`} imageUrl={config.imageUrl} alt={title} position={sideBySide ? "left" : "top"} />);
    }
  }
}
