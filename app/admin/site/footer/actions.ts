"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { setSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import type { FooterBlocksConfig } from "@/lib/footer-blocks";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
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
  const session = await requirePermission("site.edit");

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

  await logActivity(session.user, "update", "Footer");

  revalidatePath("/admin/site/footer");
  revalidateSite();
}

// ───────────────────────── Block layout (legacy footer_config) ─────────────────────────

const align = z.enum(["left", "center", "right"]);
const base = { id: z.string().max(40), alignment: align, visible: z.boolean(), titleTh: z.string().max(120), titleEn: z.string().max(120) };
const url = z.string().max(500).regex(/^(\/|https?:\/\/|mailto:|tel:|#)/, "ลิงก์ต้องขึ้นต้นด้วย / หรือ https://");
const blockSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("logo_text"), logoUrl: z.string().max(1000), textTh: z.string().max(1000), textEn: z.string().max(1000) }),
  z.object({ ...base, type: z.literal("links"), items: z.array(z.object({ labelTh: z.string().max(120), labelEn: z.string().max(120), url })).max(20) }),
  z.object({ ...base, type: z.literal("contact"), showSocial: z.boolean() }),
  z.object({ ...base, type: z.literal("social"), iconSize: z.enum(["sm", "md", "lg"]) }),
  z.object({ ...base, type: z.literal("custom_text"), textTh: z.string().max(2000), textEn: z.string().max(2000) }),
]);
const blocksSchema = z.object({ columns: z.array(z.object({ id: z.string().max(40), blocks: z.array(blockSchema).max(10) })).min(1).max(4) });

export async function saveFooterBlocks(input: FooterBlocksConfig): Promise<{ error?: string }> {
  const session = await requirePermission("site.edit");
  const parsed = blocksSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  await setSiteConfig(SITE_CONFIG_KEYS.footerBlocks, parsed.data);
  await logActivity(session.user, "update", "Footer", { targetLabel: "บล็อก Footer" });
  revalidatePath("/admin/site/footer");
  revalidateSite();
  return {};
}
