"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export type HeaderConfigInput = {
  layout: string;
  height: string;
  shadow: string;
  position: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  activeBgColor: string;
  activeTextColor: string;
  iconTextColor: string;
  logoMode: string;
  logoTextTh: string;
  logoTextEn: string;
  menuWrap: string;
  menuFontSize: string;
  menuLevels: number;
  submenuStyle: string;
  submenuChildBehavior: string;
  showSearch: boolean;
  showLanguage: boolean;
  showAccount: boolean;
  showCart: boolean;
};

export async function saveHeaderConfig(input: HeaderConfigInput) {
  await requireAdmin();

  const data = { ...input, logoTextTh: input.logoTextTh || null, logoTextEn: input.logoTextEn || null };

  await prisma.siteHeaderConfig.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/admin/site/header");
  revalidatePath("/", "layout");
}
