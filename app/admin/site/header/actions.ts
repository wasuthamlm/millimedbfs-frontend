"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { NavLink } from "@/data/nav";

export async function saveNavLinks(links: NavLink[]) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.navLink.deleteMany({ where: { placement: "HEADER" } });

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const parent = await tx.navLink.create({
        data: { labelTh: link.label, href: link.href, order: i, placement: "HEADER" },
      });
      if (link.children) {
        for (let j = 0; j < link.children.length; j++) {
          const child = link.children[j];
          await tx.navLink.create({
            data: {
              labelTh: child.label,
              href: child.href,
              order: j,
              placement: "HEADER",
              parentId: parent.id,
            },
          });
        }
      }
    }
  });

  revalidatePath("/admin/site/header");
  revalidatePath("/", "layout");
}
