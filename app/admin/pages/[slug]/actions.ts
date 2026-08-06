"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { PageSection, SectionType } from "@/data/admin-pages";
import type { SectionType as PrismaSectionType } from "@/lib/generated/prisma/client";

const TYPE_TO_DB: Record<SectionType, PrismaSectionType> = {
  "hero-banners": "HERO_BANNERS",
  "cta-bar": "CTA_BAR",
  "company-intro": "COMPANY_INTRO",
  "latest-news": "LATEST_NEWS",
  articles: "ARTICLES",
};

export async function saveSections(
  pageSlug: string,
  pageTitleTh: string,
  sections: PageSection[]
) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    const page = await tx.page.upsert({
      where: { slug: pageSlug },
      update: {},
      create: { slug: pageSlug, titleTh: pageTitleTh, status: "DRAFT" },
    });

    await tx.pageSection.deleteMany({ where: { pageId: page.id } });

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      await tx.pageSection.create({
        data: {
          pageId: page.id,
          order: i,
          type: TYPE_TO_DB[section.type],
          titleTh: section.titleTh,
          titleEn: section.titleEn,
          visibleDesktop: section.visibility.desktop,
          visibleTablet: section.visibility.tablet,
          visibleMobile: section.visibility.mobile,
          columns: section.columns,
          itemsToShow: section.itemsToShow,
          config: {
            sourceLabel: section.sourceLabel,
            anchorId: section.anchorId ?? "",
            bodyTh: section.bodyTh ?? "",
            imageUrl: section.imageUrl ?? "",
          },
        },
      });
    }
  });

  revalidatePath(`/admin/pages/${pageSlug}`);
  revalidatePath("/", "layout");
}
