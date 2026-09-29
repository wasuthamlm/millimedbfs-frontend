"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import type { Widget } from "@/data/admin-widgets";

export async function saveWidgets(widgets: Widget[]) {
  const session = await requirePermission("widget.edit");

  await prisma.$transaction(
    widgets.map((widget) =>
      prisma.widget.update({
        where: { id: widget.id },
        data: { enabled: widget.enabled, link: widget.link || null },
      })
    )
  );

  await logActivity(session.user, "update", "Widget");

  revalidatePath("/admin/site/widgets");
  revalidateSite();
}
