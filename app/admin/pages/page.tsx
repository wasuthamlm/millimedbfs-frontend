import { prisma } from "@/lib/prisma";
import { calculateSeoAeoGeo, pageToScoreInput } from "@/lib/seo-score";
import { parseConfig } from "@/lib/sections";
import { sortByPageOrder } from "@/lib/page-order";
import { PageManagerClient } from "@/components/admin/pages/PageManagerClient";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function PageManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ trash?: string }>;
}) {
  const { trash } = await searchParams;
  const showTrash = trash === "1";

  const [pagesRaw, activeCount, archivedCount, role] = await Promise.all([
    prisma.page.findMany({
      where: { archived: showTrash },
      include: { _count: { select: { sections: true } }, sections: { select: { titleTh: true, config: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.page.count({ where: { archived: false } }),
    prisma.page.count({ where: { archived: true } }),
    getAdminRole(),
  ]);
  const pages = showTrash ? pagesRaw : sortByPageOrder(pagesRaw);

  const rows = pages.map((page) => ({
    id: page.id,
    slug: page.slug,
    titleTh: page.titleTh,
    titleEn: page.titleEn,
    status: page.status,
    sectionsCount: page._count.sections,
    seoScore: calculateSeoAeoGeo(
      pageToScoreInput({
        titleTh: page.titleTh,
        titleEn: page.titleEn,
        seoTitle: page.seoTitle,
        seoTitleEn: page.seoTitleEn,
        seoDesc: page.seoDesc,
        seoDescEn: page.seoDescEn,
        slug: page.slug,
        sections: page.sections.map((sec) => {
          const config = parseConfig(sec.config);
          return { titleTh: sec.titleTh, bodyTh: config.bodyTh, imageUrl: config.imageUrl };
        }),
      }),
    ).overall, // same number as the page editor's badge
  }));

  return (
    <PageManagerClient
      pages={rows}
      activeCount={activeCount}
      archivedCount={archivedCount}
      showTrash={showTrash}
      canPublish={canDo(role, "page.publish")}
      canDelete={canDo(role, "page.delete")}
    />
  );
}
