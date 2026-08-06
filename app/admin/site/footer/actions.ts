"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { FooterColumn } from "@/data/admin-footer";

type FooterContactInput = {
  phone: string;
  email: string;
  address: string;
  tagline: string;
};

export type FooterThemeInput = {
  bgColor: string;
  textColor: string;
  accentColor: string;
  desktopColumns: number;
  copyrightTh: string;
  copyrightEn: string;
};

export async function saveFooterConfig(
  columns: FooterColumn[],
  contact: FooterContactInput,
  theme: FooterThemeInput
) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.footerColumn.deleteMany({});
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const created = await tx.footerColumn.create({ data: { title: column.title, order: i } });
      for (let j = 0; j < column.links.length; j++) {
        const link = column.links[j];
        await tx.footerLink.create({
          data: { columnId: created.id, label: link.label, href: link.href, order: j },
        });
      }
    }

    await tx.footerContact.upsert({
      where: { id: "singleton" },
      update: contact,
      create: { id: "singleton", ...contact },
    });

    await tx.footerConfig.upsert({
      where: { id: "singleton" },
      update: {
        bgColor: theme.bgColor,
        textColor: theme.textColor,
        accentColor: theme.accentColor,
        desktopColumns: theme.desktopColumns,
        copyrightTh: theme.copyrightTh || null,
        copyrightEn: theme.copyrightEn || null,
      },
      create: {
        id: "singleton",
        bgColor: theme.bgColor,
        textColor: theme.textColor,
        accentColor: theme.accentColor,
        desktopColumns: theme.desktopColumns,
        copyrightTh: theme.copyrightTh || null,
        copyrightEn: theme.copyrightEn || null,
      },
    });
  });

  revalidatePath("/admin/site/footer");
  revalidatePath("/", "layout");
}
