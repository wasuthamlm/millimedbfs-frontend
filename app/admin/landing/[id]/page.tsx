import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import { POST_CARD_INCLUDE, toArticleView, toNewsView } from "@/lib/post-view";
import { rowsToEditorSections } from "@/lib/section-rows";
import { parseLandingFaq, parseLandingFooter, parseLandingHeader, parseLandingWidget } from "@/lib/landing";
import { LandingEditor } from "@/components/admin/landing/LandingEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/admin/landing/[id]">): Promise<Metadata> {
  const { id } = await params;
  const page = await prisma.landingPage.findUnique({ where: { id }, select: { titleTh: true } });
  return { title: page ? `แก้ไข: ${page.titleTh}` : "ไม่พบ Landing Page" };
}

export default async function LandingEditorRoute({ params }: PageProps<"/admin/landing/[id]">) {
  const { id } = await params;
  const [page, articleCount, newsCount, articlePosts, newsPosts, productCategories, articleTypes, productOptions, role] = await Promise.all([
    prisma.landingPage.findUnique({ where: { id }, include: { sections: { orderBy: { order: "asc" } } } }),
    prisma.post.count({ where: { kind: "ARTICLE", status: "PUBLISHED" } }),
    prisma.post.count({ where: { kind: "NEWS", status: "PUBLISHED" } }),
    prisma.post.findMany({ where: { kind: "ARTICLE", status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, include: POST_CARD_INCLUDE, take: 12 }),
    prisma.post.findMany({ where: { kind: "NEWS", status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, include: POST_CARD_INCLUDE, take: 12 }),
    prisma.productCategory.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, nameTh: true, parentId: true } }),
    prisma.articleCategory.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, nameTh: true } }),
    prisma.product.findMany({ where: { deletedAt: null }, orderBy: { nameTh: "asc" }, select: { id: true, nameTh: true } }),
    getAdminRole(),
  ]);
  if (!page || page.deletedAt) notFound();

  return (
    <LandingEditor
      initial={{
        id: page.id,
        status: page.status,
        titleTh: page.titleTh,
        titleEn: page.titleEn ?? "",
        slug: page.slug,
        coverImageUrl: page.coverImageUrl ?? "",
        seoTitle: page.seoTitle ?? "",
        seoTitleEn: page.seoTitleEn ?? "",
        seoDesc: page.seoDesc ?? "",
        seoDescEn: page.seoDescEn ?? "",
        ogTitle: page.ogTitle ?? "",
        ogTitleEn: page.ogTitleEn ?? "",
        ogDesc: page.ogDesc ?? "",
        ogDescEn: page.ogDescEn ?? "",
        ogImageUrl: page.ogImageUrl ?? "",
        focusKeyword: page.focusKeyword ?? "",
        canonicalUrl: page.canonicalUrl ?? "",
        noIndex: page.noIndex,
        geoPlaceName: page.geoPlaceName ?? "",
        geoAddress: page.geoAddress ?? "",
        geoLatitude: page.geoLatitude ?? "",
        geoLongitude: page.geoLongitude ?? "",
        marketingEligible: page.marketingEligible,
        theme: {
          useSiteColors: page.useSiteColors,
          primaryColor: page.primaryColor,
          accentColor: page.accentColor,
          bgColor: page.bgColor,
          textColor: page.textColor,
        },
        header: parseLandingHeader(page.headerConfig),
        footer: parseLandingFooter(page.footerConfig),
        widget: parseLandingWidget(page.widgetConfig),
        faq: parseLandingFaq(page.faq),
      }}
      initialSections={rowsToEditorSections(page.sections)}
      canPublish={canDo(role, "page.publish")}
      articleCount={articleCount}
      newsCount={newsCount}
      previewArticles={articlePosts.map((p) => toArticleView(p))}
      previewNews={newsPosts.map((p) => toNewsView(p))}
      productCategories={productCategories}
      articleTypes={articleTypes}
      productOptions={productOptions.map((p) => ({ id: p.id, label: p.nameTh }))}
    />
  );
}
