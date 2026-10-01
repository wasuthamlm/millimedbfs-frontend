"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { buildSectionRows } from "@/lib/section-rows";
import type { PageSection } from "@/lib/sections";

export async function saveSections(
  pageSlug: string,
  pageTitleTh: string,
  sections: PageSection[],
): Promise<{ error?: string }> {
  const session = await requirePermission("page.edit");
  if (sections.length > 60) return { error: "บล็อกในหน้าเดียวต้องไม่เกิน 60 บล็อก" };

  const built = buildSectionRows(sections);
  if ("error" in built) return { error: built.error };
  const rows = built.rows;

  await prisma.$transaction(async (tx) => {
    const page = await tx.page.upsert({
      where: { slug: pageSlug },
      update: {},
      create: { slug: pageSlug, titleTh: pageTitleTh, status: "DRAFT" },
    });
    await tx.pageSection.deleteMany({ where: { pageId: page.id } });
    await tx.pageSection.createMany({ data: rows.map((r) => ({ ...r, pageId: page.id })) });
  });

  await logActivity(session.user, "update", "Page", {
    targetLabel: pageTitleTh,
    details: `บันทึกบล็อก ${sections.length} รายการ (${pageSlug})`,
  });

  revalidatePath(`/admin/pages/${pageSlug}`);
  revalidateSite();
  return {};
}
