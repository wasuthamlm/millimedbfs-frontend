import { prisma } from "@/lib/prisma";
import { calculatePageSeoScore } from "@/lib/seo-score";
import { sortByPageOrder } from "@/lib/page-order";
import { PageManagerClient } from "@/components/admin/pages/PageManagerClient";

export const dynamic = "force-dynamic";

export default async function PageManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ trash?: string }>;
}) {
  const { trash } = await searchParams;
  const showTrash = trash === "1";

  const [pagesRaw, activeCount, archivedCount] = await Promise.all([
    prisma.page.findMany({
      where: { archived: showTrash },
      include: { _count: { select: { sections: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.page.count({ where: { archived: false } }),
    prisma.page.count({ where: { archived: true } }),
  ]);
  const pages = showTrash ? pagesRaw : sortByPageOrder(pagesRaw);

  const rows = pages.map((page) => ({
    id: page.id,
    slug: page.slug,
    titleTh: page.titleTh,
    titleEn: page.titleEn,
    status: page.status,
    sectionsCount: page._count.sections,
    seoScore: calculatePageSeoScore({
      titleTh: page.titleTh,
      titleEn: page.titleEn,
      seoTitle: page.seoTitle,
      seoDesc: page.seoDesc,
      slug: page.slug,
      sectionsCount: page._count.sections,
    }).score,
  }));

  return <PageManagerClient pages={rows} activeCount={activeCount} archivedCount={archivedCount} showTrash={showTrash} />;
}
