import Image from "next/image";
import type { Prisma } from "@/lib/generated/prisma/client";
import { HeroBanners, type HeroBannerItem, type HeroBannerConfig } from "@/components/home/HeroBanners";
import { LatestNews } from "@/components/home/LatestNews";
import { ArticlesGrid } from "@/components/home/ArticlesGrid";
import { PRODUCT_CARD_SELECT, ProductGrid } from "@/components/products/ProductGrid";
import { SectionShell, SectionTitle, RichText, visibilityClass } from "@/components/site/sections/SectionShell";
import {
  AboutCards,
  ContactInfoBlock,
  CtaButtonsRow,
  DownloadButton,
  GalleryGrid,
  LayoutColumns,
  TextColumns,
  TextImage,
  VideoEmbed,
} from "@/components/site/sections/blocks";
import { AnchorNav } from "@/components/site/sections/AnchorNav";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { POST_CARD_INCLUDE, toArticleView, toNewsView, type ArticleView, type NewsView } from "@/lib/post-view";
import { parseConfig, type SectionConfig } from "@/lib/sections";
import { mapEmbedSrc } from "@/lib/map-embed";
import { localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { ui } from "@/lib/i18n/ui";
import type { SectionType } from "@/lib/generated/prisma/client";

type SectionRow = {
  id: string;
  order: number;
  type: SectionType;
  titleTh: string;
  titleEn: string | null;
  bodyEn?: string | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
  columns: number | null;
  itemsToShow: number | null;
  config: unknown;
};

const clean = (html?: string) => (html ? sanitizeHtml(html) : undefined);

/** Sanitizes every HTML field before it reaches dangerouslySetInnerHTML. */
function sanitized(config: SectionConfig): SectionConfig {
  return {
    ...config,
    bodyTh: clean(config.bodyTh),
    bodyEn: clean(config.bodyEn),
    layoutColumns: config.layoutColumns?.map((c) => ({ ...c, bodyTh: clean(c.bodyTh), bodyEn: clean(c.bodyEn) })),
    cards: config.cards?.map((c) => ({ ...c, bodyTh: clean(c.bodyTh) ?? "", bodyEn: clean(c.bodyEn) })),
  };
}

async function productsFor(section: SectionRow, config: SectionConfig) {
  const limit = Math.min(48, section.itemsToShow ?? 8);
  if (config.productSort === "manual" && config.productIds?.length) {
    const rows = await prisma.product.findMany({
      where: { id: { in: config.productIds }, status: "ACTIVE", deletedAt: null },
      select: PRODUCT_CARD_SELECT,
    });
    const order = new Map(config.productIds.map((id, i) => [id, i]));
    return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)).slice(0, limit);
  }
  let categoryFilter: Prisma.ProductWhereInput = {};
  if (config.productCategoryId) {
    const all = await prisma.productCategory.findMany({ select: { id: true, parentId: true } });
    const ids = [config.productCategoryId];
    for (let i = 0; i < ids.length; i++) for (const c of all) if (c.parentId === ids[i]) ids.push(c.id);
    categoryFilter = { OR: [{ categoryId: { in: ids } }, { subCategoryId: { in: ids } }] };
  }
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    config.productSort === "name"
      ? { nameTh: "asc" }
      : config.productSort === "price-asc"
        ? { price: "asc" }
        : config.productSort === "price-desc"
          ? { price: "desc" }
          : { createdAt: "desc" };
  return prisma.product.findMany({
    where: { status: "ACTIVE", deletedAt: null, ...categoryFilter },
    orderBy,
    take: limit,
    select: PRODUCT_CARD_SELECT,
  });
}

async function postsFor(section: SectionRow, config: SectionConfig, kind?: "NEWS" | "ARTICLE") {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      ...(kind ? { kind } : {}),
      ...(config.articleTypeId ? { categoryId: config.articleTypeId } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: Math.min(48, section.itemsToShow ?? 6),
    include: POST_CARD_INCLUDE,
  });
  return posts;
}

export async function PageSectionsRenderer({
  sections,
  newsItems,
  articleItems,
  bannerItems,
  bannerConfig,
  locale = "th",
}: {
  sections: SectionRow[];
  newsItems: NewsView[];
  articleItems: ArticleView[];
  bannerItems: HeroBannerItem[];
  bannerConfig?: HeroBannerConfig;
  locale?: string;
}) {
  const lang = locale === "en" ? "en" : "th";
  const needs = (t: SectionType) => sections.some((s) => s.type === t);
  const [siteSettings, contact] = await Promise.all([
    needs("YOUTUBE") ? prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { youtubeEmbedUrl: true } }) : null,
    needs("CONTACT_INFO") ? prisma.footerContact.findUnique({ where: { id: "singleton" } }) : null,
  ]);
  const localizeViews = <T extends { href: string }>(items: T[]) => items.map((i) => ({ ...i, href: localePath(locale, i.href) }));
  // Block titles/bodies in the visitor's language (EN columns, then Translation rows, then Thai).
  const tSection = await loadLocalizer(locale, [["PAGE_SECTION", sections.map((s) => s.id)]]);
  const localizedPosts = async (posts: Awaited<ReturnType<typeof postsFor>>) => {
    const t = await loadLocalizer(locale, [["ARTICLE", posts.map((p) => p.id)]]);
    return { news: posts.map((p) => toNewsView(p, t)), articles: posts.map((p) => toArticleView(p, t)) };
  };

  const rendered = await Promise.all(
    sections.map(async (section) => {
      // Hidden on every device: skip it entirely (and its data queries) rather than ship hidden markup.
      if (!section.visibleDesktop && !section.visibleTablet && !section.visibleMobile) return null;
      const config = sanitized(parseConfig(section.config));
      const title = tSection("PAGE_SECTION", section.id, "title", section.titleTh, section.titleEn);
      const enBody = section.bodyEn ? clean(section.bodyEn) : config.bodyEn;
      const body = locale === "th" ? config.bodyTh : clean(tSection("PAGE_SECTION", section.id, "body", config.bodyTh, enBody));
      const visibility = { desktop: section.visibleDesktop, tablet: section.visibleTablet, mobile: section.visibleMobile };
      const light = config.background?.textColor === "light";
      const align = config.spacing?.textAlign;
      const shell = (children: React.ReactNode, maxWidth?: "sm" | "md" | "lg" | "xl" | "full") => (
        <SectionShell key={section.id} config={config} visibility={visibility} defaultMaxWidth={maxWidth}>
          {children}
        </SectionShell>
      );

      switch (section.type) {
        case "HERO_BANNERS":
          return (
            <div key={section.id} id={config.anchorId || undefined} className={visibilityClass(visibility)}>
              <HeroBanners banners={bannerItems} config={bannerConfig} />
            </div>
          );
        case "CTA_BAR":
          // Kept for backward compatibility with saved pages; the global promo bar was removed.
          return null;
        case "LATEST_NEWS": {
          const items = config.articleTypeId ? (await localizedPosts(await postsFor(section, config, "NEWS"))).news : newsItems;
          return (
            <div key={section.id} id={config.anchorId || undefined} className={visibilityClass(visibility)}>
              <LatestNews locale={locale} title={title || undefined} items={localizeViews(items).slice(0, section.itemsToShow ?? 3)} />
            </div>
          );
        }
        case "ARTICLES":
        case "DATA_ARTICLES": {
          const items =
            section.type === "DATA_ARTICLES" || config.articleTypeId ? (await localizedPosts(await postsFor(section, config))).articles : articleItems;
          return (
            <div key={section.id} id={config.anchorId || undefined} className={visibilityClass(visibility)}>
              <ArticlesGrid locale={locale} title={title || undefined} items={localizeViews(items).slice(0, section.itemsToShow ?? 8)} columns={section.columns ?? undefined} />
            </div>
          );
        }
        case "DATA_PRODUCTS": {
          const products = await productsFor(section, config);
          if (!products.length) return null;
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <ProductGrid products={products} locale={locale} />
            </>,
            "xl",
          );
        }
        case "TEXT":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <RichText html={body} />
            </>,
            "md",
          );
        case "COLUMNS":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <TextColumns html={body} columns={section.columns ?? 2} />
            </>,
          );
        case "TEXT_IMAGE":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <TextImage html={body} imageUrl={config.imageUrl} alt={config.imageAlt || title} position={config.imagePosition} />
            </>,
          );
        case "VIDEO":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <VideoEmbed url={config.videoUrl} width={config.videoWidth} title={title} />
              {body && <RichText html={body} className="mt-6" />}
            </>,
          );
        case "YOUTUBE":
          if (!siteSettings?.youtubeEmbedUrl) return null;
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <VideoEmbed url={siteSettings.youtubeEmbedUrl} title={title} />
            </>,
          );
        case "GALLERY":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <GalleryGrid urls={config.galleryUrls ?? []} columns={section.columns ?? 3} alt={title} />
            </>,
            "xl",
          );
        case "CTA":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <RichText html={body} />
              <CtaButtonsRow cta={config.cta} lang={lang} align={align} />
            </>,
            "md",
          );
        case "LAYOUT":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <LayoutColumns
                columns={config.layoutColumns ?? []}
                gap={config.layoutGap}
                align={config.layoutAlign}
                stackOnMobile={config.stackOnMobile !== false}
                lang={lang}
              />
            </>,
          );
        case "DOWNLOAD":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <RichText html={body} className="mb-6" />
              <DownloadButton url={config.fileUrl} label={(lang === "en" && config.fileLabelEn) || config.fileLabelTh || ui(locale, "download")} />
            </>,
            "md",
          );
        case "CONTACT_INFO":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <ContactInfoBlock
                locale={locale}
                info={{
                  companyName: lang === "en" ? contact?.companyNameEn || contact?.companyNameTh : contact?.companyNameTh,
                  address: lang === "en" ? contact?.addressEn || contact?.address : contact?.address,
                  phone: contact?.phone,
                  email: contact?.email,
                  lineId: contact?.lineId,
                  taxId: contact?.taxId,
                  mapEmbedSrc: mapEmbedSrc(contact?.googleMapsEmbedUrl),
                }}
              />
            </>,
          );
        case "ANCHOR_NAV":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <AnchorNav
                light={light}
                label={title || undefined}
                links={(config.navLinks ?? []).map((l) => ({ anchorId: l.anchorId, label: (lang === "en" && l.labelEn) || l.labelTh }))}
              />
            </>,
            "xl",
          );
        case "ABOUT_TEASER":
          return shell(
            <>
              <SectionTitle title={title} light={light} />
              <RichText html={body} className="mb-8" />
              <AboutCards cards={config.cards ?? []} columns={section.columns ?? 3} lang={lang} />
            </>,
            "xl",
          );
        case "COMPANY_INTRO":
        case "CUSTOM":
        default: {
          // Legacy content block: heading, optional image, body; columns = 2 puts the image beside the text.
          if (!title && !body && !config.imageUrl) return null;
          const sideBySide = section.columns === 2 && Boolean(config.imageUrl);
          const image = config.imageUrl ? (
            <div className={`relative w-full overflow-hidden rounded-xl bg-slate-100 ${sideBySide ? "" : "mb-4"}`}>
              <Image src={config.imageUrl} alt={config.imageAlt || title} width={1600} height={1000} unoptimized className="h-auto w-full object-contain" />
            </div>
          ) : null;
          const heading = title ? (
            <h2 className={`mb-4 text-2xl font-bold ${light ? "text-white" : "text-slate-900"} ${sideBySide || align ? "" : "text-center"}`}>{title}</h2>
          ) : null;
          const text = body ? <RichText html={body} className="text-base text-slate-600" /> : null;
          return shell(
            sideBySide ? (
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                {image}
                <div>
                  {heading}
                  {text}
                </div>
              </div>
            ) : (
              <>
                {heading}
                {image}
                {text}
              </>
            ),
            sideBySide ? "lg" : "md",
          );
        }
      }
    }),
  );

  return <>{rendered}</>;
}
