import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GlobeIcon } from "@/components/ui/admin-icons";
import { adminPages } from "@/data/admin-pages";
import type { PageSection, SectionType } from "@/data/admin-pages";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { prisma } from "@/lib/prisma";
import { toArticleView, toNewsView } from "@/lib/post-view";
import type { SectionType as PrismaSectionType } from "@/lib/generated/prisma/client";

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
  const page = adminPages.find((p) => p.slug === slug);
  return { title: page ? `แก้ไข: ${page.titleTh}` : "ไม่พบหน้า" };
}

export default async function PageEditorRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = adminPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const [dbPage, articleCount, newsCount, articlePosts, newsPosts] = await Promise.all([
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
  ]);
  const previewArticles = articlePosts.map(toArticleView);
  const previewNews = newsPosts.map(toNewsView);

  const sections: PageSection[] = (dbPage?.sections ?? []).map((row) => {
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
          title={page.titleTh}
          subtitle={`/${page.slug} · ${page.titleEn}`}
        />
        <div className="flex items-center gap-3">
          <StatusBadge status={page.status} />
          <Link
            href="/admin/pages"
            className="text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
          >
            ← กลับไป Page Manager
          </Link>
        </div>
      </div>

      <PageEditor
        page={page}
        initialSections={sections}
        articleCount={articleCount}
        newsCount={newsCount}
        previewArticles={previewArticles}
        previewNews={previewNews}
      />
    </div>
  );
}
