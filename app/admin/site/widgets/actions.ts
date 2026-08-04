"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { Widget } from "@/data/admin-widgets";

export async function saveWidgets(widgets: Widget[]) {
  await requireAdmin();

  await prisma.$transaction(
    widgets.map((widget) =>
      prisma.widget.update({
        where: { id: widget.id },
        data: { enabled: widget.enabled, link: widget.link || null },
      })
    )
  );

  revalidatePath("/admin/site/widgets");
  revalidatePath("/", "layout");
}
