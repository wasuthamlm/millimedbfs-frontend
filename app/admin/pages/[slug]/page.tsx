import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GlobeIcon } from "@/components/ui/admin-icons";
import type { PageSection, SectionType } from "@/data/admin-pages";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { prisma } from "@/lib/prisma";
import { toArticleView, toNewsView } from "@/lib/post-view";
import type { SectionType as PrismaSectionType } from "@/lib/generated/prisma/client";
import type { NavLink } from "@/data/nav";

const TYPE_FROM_DB: Record<PrismaSectionType, SectionType> = {
  HERO_BANNERS: "hero-banners",
  CTA_BAR: "cta-bar",
  COMPANY_INTRO: "company-intro",
  LATEST_NEWS: "latest-news",
  ARTICLES: "articles",
  CUSTOM: "articles",
};

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

  const [dbPage, articleCount, newsCount, articlePosts, newsPosts, navRows, footerColumns, footerContact] =
    await Promise.all([
      prisma.page.findUnique({
        where: { slug },
        include: { sections: { orderBy: { order: "asc" } } },
      }),
      prisma.post.count({ where: { kind: "ARTICLE", status: "PUBLISHED" } }),
      prisma.post.count({ where: { kind: "NEWS", status: "PUBLISHED" } }),
      prisma.post.findMany({
        where: { kind: "ARTICLE", status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { coverImage: true },
      }),
      prisma.post.findMany({
        where: { kind: "NEWS", status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { coverImage: true },
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
    ]);

  if (!dbPage) notFound();

  const previewArticles = articlePosts.map(toArticleView);
  const previewNews = newsPosts.map(toNewsView);
  const navLinks: NavLink[] = navRows
    .filter((row) => !row.parentId)
    .map((row) => ({
      label: row.labelTh,
      href: row.href,
      children: row.children.length
        ? row.children.map((child) => ({ label: child.labelTh, href: child.href }))
        : undefined,
    }));

  const sections: PageSection[] = dbPage.sections.map((row) => {
    const config = (row.config as { sourceLabel?: string } | null) ?? {};
    return {
      id: row.id,
      order: row.order,
      type: TYPE_FROM_DB[row.type],
      titleTh: row.titleTh,
      titleEn: row.titleEn ?? "",
      sourceLabel: config.sourceLabel ?? "",
      visibility: {
        desktop: row.visibleDesktop,
        tablet: row.visibleTablet,
        mobile: row.visibleMobile,
      },
      columns: row.columns ?? undefined,
      itemsToShow: row.itemsToShow ?? undefined,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          icon={GlobeIcon}
          title={dbPage.titleTh}
          subtitle={`/${dbPage.slug}${dbPage.titleEn ? ` · ${dbPage.titleEn}` : ""}`}
        />
        <div className="flex items-center gap-3">
          <StatusBadge status={dbPage.status} />
          <Link
            href="/admin/pages"
            className="text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
          >
            ← กลับไป Page Manager
          </Link>
        </div>
      </div>

      <PageEditor
        page={{ slug: dbPage.slug, titleTh: dbPage.titleTh }}
        initialSections={sections}
        articleCount={articleCount}
        newsCount={newsCount}
        previewArticles={previewArticles}
        previewNews={previewNews}
        navLinks={navLinks}
        footerColumns={footerColumns}
        footerContact={footerContact}
      />
    </div>
  );
}
