"use server";

import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";
import { videoSource } from "@/lib/video-embed";
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

export type BannerStatus = "DRAFT" | "PUBLISHED";

/**
 * Saves the slides. `status` publishes/unpublishes the whole slider at the same time;
 * without the publish right the slider is always saved as a draft (legacy behaviour).
 */
export async function saveBanners(banners: Banner[], status?: BannerStatus): Promise<{ error?: string; status: BannerStatus }> {
  const session = await requirePermission("banner.edit");
  const canPublish = canDo(session.user.role, "banner.publish");
  const current = (await prisma.siteBannerConfig.findUnique({ where: { id: "singleton" } }))?.status ?? "PUBLISHED";
  const nextStatus: BannerStatus = canPublish ? (status ?? current) : "DRAFT";

  for (const [i, b] of banners.entries()) {
    const type = b.mediaType ?? "image";
    if (type === "image" && !b.image) return { error: `แบนเนอร์ ${i + 1}: กรุณาอัปโหลดรูปภาพ`, status: current };
    if (type !== "image" && !b.videoUrl) return { error: `แบนเนอร์ ${i + 1}: กรุณาใส่วิดีโอ`, status: current };
    if ((type === "youtube" || type === "vimeo") && videoSource(b.videoUrl)?.kind !== "iframe") {
      return { error: `แบนเนอร์ ${i + 1}: ลิงก์ ${type === "youtube" ? "YouTube" : "Vimeo"} ไม่ถูกต้อง`, status: current };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.banner.deleteMany({});
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      const type = banner.mediaType ?? "image";
      const media = banner.image ? await getOrCreateMedia(tx, banner.image) : null;
      await tx.banner.create({
        data: {
          titleTh: banner.titleTh,
          titleEn: banner.titleEn || null,
          altTextTh: banner.altTextTh || null,
          altTextEn: banner.altTextEn || null,
          captionTh: banner.captionTh || null,
          captionEn: banner.captionEn || null,
          imageId: media?.id ?? null,
          mediaType: type,
          videoUrl: type === "image" ? null : banner.videoUrl || null,
          posterUrl: type === "image" ? null : banner.image || null,
          link: banner.link,
          order: i,
          active: banner.active,
        },
      });
    }
    await tx.siteBannerConfig.upsert({
      where: { id: "singleton" },
      update: { status: nextStatus },
      create: { id: "singleton", status: nextStatus, autoplay: false },
    });
  });

  await logActivity(session.user, nextStatus === current ? "update" : nextStatus === "PUBLISHED" ? "publish" : "unpublish", "Banner", {
    targetLabel: "แบนเนอร์",
    details: `${banners.length} รายการ · ${nextStatus === "PUBLISHED" ? "เผยแพร่" : "ฉบับร่าง"}`,
  });

  revalidatePath("/admin/site/banners");
  revalidateSite();
  return { status: nextStatus };
}
