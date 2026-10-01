import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PageSection } from "@/lib/sections";
import { rowsToEditorSections } from "@/lib/section-rows";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { POST_CARD_INCLUDE, toArticleView, toNewsView } from "@/lib/post-view";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";
import type { NavLink } from "@/data/nav";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  return { title: page ? `แก้ไข: ${page.titleTh}` : "ไม่พบหน้า" };
}

export default async function PageEditorRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [
    dbPage,
    articleCount,
    newsCount,
    articlePosts,
    newsPosts,
    navRows,
    footerColumns,
    footerContact,
    navLinkCount,
    productCategories,
    articleTypes,
    productOptions,
    role,
  ] = await Promise.all([
      prisma.page.findUnique({
        where: { slug },
        include: { sections: { orderBy: { order: "asc" } } },
      }),
      prisma.post.count({ where: { kind: "ARTICLE", status: "PUBLISHED" } }),
      prisma.post.count({ where: { kind: "NEWS", status: "PUBLISHED" } }),
      prisma.post.findMany({
        where: { kind: "ARTICLE", status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: POST_CARD_INCLUDE,
      }),
      prisma.post.findMany({
        where: { kind: "NEWS", status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: POST_CARD_INCLUDE,
      }),
      prisma.navLink.findMany({
        where: { placement: "HEADER" },
        orderBy: { order: "asc" },
        include: { children: { orderBy: { order: "asc" } } },
      }),
      prisma.footerColumn.findMany({
        orderBy: { order: "asc" },
        include: { links: { orderBy: { order: "asc" } } },
      }),
      prisma.footerContact.findUnique({ where: { id: "singleton" } }),
      prisma.navLink.count({ where: { href: slug === "home" ? "/" : `/${slug}` } }),
      prisma.productCategory.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, nameTh: true, parentId: true } }),
      prisma.articleCategory.findMany({ where: { active: true }, orderBy: { order: "asc" }, select: { id: true, nameTh: true } }),
      prisma.product.findMany({ where: { deletedAt: null }, orderBy: { nameTh: "asc" }, select: { id: true, nameTh: true } }),
      getAdminRole(),
    ]);

  if (!dbPage) notFound();

  const previewArticles = articlePosts.map((p) => toArticleView(p));
  const previewNews = newsPosts.map((p) => toNewsView(p));
  const navLinks: NavLink[] = navRows
    .filter((row) => !row.parentId)
    .map((row) => ({
      id: row.id,
      label: row.labelTh,
      href: row.href,
      children: row.children.length
        ? row.children.map((child) => ({ id: child.id, label: child.labelTh, href: child.href }))
        : undefined,
    }));

  const sections: PageSection[] = rowsToEditorSections(dbPage.sections);

  const seoScore = calculateSeoAeoGeo(
    pageToScoreInput({
      titleTh: dbPage.titleTh,
      titleEn: dbPage.titleEn,
      seoTitle: dbPage.seoTitle,
      seoTitleEn: dbPage.seoTitleEn,
      seoDesc: dbPage.seoDesc,
      seoDescEn: dbPage.seoDescEn,
      slug: dbPage.slug,
      sections: sections.map((sec) => ({ titleTh: sec.titleTh, bodyTh: sec.config.bodyTh, imageUrl: sec.config.imageUrl })),
    }),
  ).overall;

  return (
    <PageEditor
      page={{ id: dbPage.id, slug: dbPage.slug, titleTh: dbPage.titleTh, titleEn: dbPage.titleEn ?? "", status: dbPage.status }}
      initialSections={sections}
      seoScore={seoScore}
      seoInitial={{
        seoTitle: dbPage.seoTitle ?? "",
        seoDesc: dbPage.seoDesc ?? "",
        seoTitleEn: dbPage.seoTitleEn ?? "",
        seoDescEn: dbPage.seoDescEn ?? "",
        seoNoIndex: dbPage.seoNoIndex,
        ogTitle: dbPage.ogTitle ?? "",
        ogTitleEn: dbPage.ogTitleEn ?? "",
        ogDesc: dbPage.ogDesc ?? "",
        ogDescEn: dbPage.ogDescEn ?? "",
        ogImageUrl: dbPage.ogImageUrl ?? "",
        canonicalUrl: dbPage.canonicalUrl ?? "",
        schemaCustom: dbPage.schemaCustom ? JSON.stringify(dbPage.schemaCustom, null, 2) : "",
        marketingEligible: dbPage.marketingEligible,
        heroStyle: dbPage.heroStyle ?? "",
        heroAlignment: dbPage.heroAlignment ?? "",
      }}
      navLinkCount={navLinkCount}
      articleCount={articleCount}
      newsCount={newsCount}
      previewArticles={previewArticles}
      previewNews={previewNews}
      navLinks={navLinks}
      footerColumns={footerColumns}
      footerContact={footerContact}
      productCategories={productCategories}
      articleTypes={articleTypes}
      productOptions={productOptions.map((p) => ({ id: p.id, label: p.nameTh }))}
      canPublish={canDo(role, "page.publish")}
    />
  );
}
