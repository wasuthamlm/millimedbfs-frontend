"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { PopupConfig } from "@/data/admin-popup";

export async function savePopupConfig(config: PopupConfig) {
  await requireAdmin();

  let imageId: string | undefined;
  if (config.image) {
    const existing = await prisma.media.findFirst({ where: { url: config.image } });
    const media =
      existing ??
      (await prisma.media.create({
        data: {
          url: config.image,
          filename: config.image.split("/").pop() ?? "popup.svg",
          mimeType: "image/svg+xml",
          size: 0,
        },
      }));
    imageId = media.id;
  }

  await prisma.popupConfig.upsert({
    where: { id: "singleton" },
    update: {
      enabled: config.enabled,
      titleTh: config.titleTh,
      imageId,
      link: config.link,
      frequency: config.frequency,
      startDate: new Date(config.startDate),
      endDate: new Date(config.endDate),
    },
    create: {
      id: "singleton",
      enabled: config.enabled,
      titleTh: config.titleTh,
      imageId,
      link: config.link,
      frequency: config.frequency,
      startDate: new Date(config.startDate),
      endDate: new Date(config.endDate),
    },
  });

  revalidatePath("/admin/site/popup");
  revalidatePath("/", "layout");
}
