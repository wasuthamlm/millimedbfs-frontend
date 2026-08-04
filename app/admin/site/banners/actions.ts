"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getOrCreateMedia } from "@/lib/media";
import type { Banner } from "@/data/admin-banners";

export async function saveBanners(banners: Banner[]) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.banner.deleteMany({});
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      const media = await getOrCreateMedia(tx, banner.image);
      await tx.banner.create({
        data: {
          titleTh: banner.titleTh,
          imageId: media.id,
          link: banner.link,
          order: i,
          active: banner.active,
        },
      });
    }
  });

  revalidatePath("/admin/site/banners");
  revalidatePath("/", "layout");
}
