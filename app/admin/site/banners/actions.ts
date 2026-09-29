"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { getOrCreateMedia } from "@/lib/media";
import type { Banner } from "@/data/admin-banners";

export type BannerConfigInput = {
  transitionEffect: string;
  direction: string;
  transitionSpeedMs: number;
  displayDurationMs: number;
  autoplay: boolean;
  loop: boolean;
  pauseOnHover: boolean;
  showArrows: boolean;
  showDots: boolean;
};

export async function saveBannerConfig(input: BannerConfigInput) {
  const session = await requirePermission("banner.edit");

  await prisma.siteBannerConfig.upsert({
    where: { id: "singleton" },
    update: input,
    create: { id: "singleton", ...input },
  });

  await logActivity(session.user, "update", "Banner", { targetLabel: "ตั้งค่าสไลด์" });

  revalidatePath("/admin/site/banners");
  revalidateSite();
}

export async function saveBanners(banners: Banner[]) {
  const session = await requirePermission("banner.edit");

  await prisma.$transaction(async (tx) => {
    await tx.banner.deleteMany({});
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      const media = await getOrCreateMedia(tx, banner.image);
      await tx.banner.create({
        data: {
          titleTh: banner.titleTh,
          titleEn: banner.titleEn || null,
          altTextTh: banner.altTextTh || null,
          altTextEn: banner.altTextEn || null,
          captionTh: banner.captionTh || null,
          captionEn: banner.captionEn || null,
          imageId: media.id,
          link: banner.link,
          order: i,
          active: banner.active,
        },
      });
    }
  });

  await logActivity(session.user, "update", "Banner", { targetLabel: "แบนเนอร์", details: `${banners.length} รายการ` });

  revalidatePath("/admin/site/banners");
  revalidateSite();
}
