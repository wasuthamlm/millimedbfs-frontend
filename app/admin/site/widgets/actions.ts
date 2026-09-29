"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import type { Widget } from "@/data/admin-widgets";

export async function saveWidgets(widgets: Widget[]) {
  await requirePermission("widget.edit");

  await prisma.$transaction(
    widgets.map((widget) =>
      prisma.widget.update({
        where: { id: widget.id },
        data: { enabled: widget.enabled, link: widget.link || null },
      })
    )
  );

  revalidatePath("/admin/site/widgets");
  revalidateSite();
}
