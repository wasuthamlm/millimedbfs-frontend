import "server-only";
import { prisma } from "@/lib/prisma";
import type { HeroBannerConfig, HeroBannerItem } from "@/components/home/HeroBanners";

/** Published hero slides + slider settings. While the slider is a draft nothing is shown publicly (legacy behaviour). */
export async function loadHeroBanners(locale = "th"): Promise<{ items: HeroBannerItem[]; config?: HeroBannerConfig }> {
  const [rows, config] = await Promise.all([
    prisma.banner.findMany({ where: { active: true }, orderBy: { order: "asc" }, include: { image: true } }),
    prisma.siteBannerConfig.findUnique({ where: { id: "singleton" } }),
  ]);
  if (config?.status === "DRAFT") return { items: [] };

  const en = locale === "en";
  const items: HeroBannerItem[] = rows
    .map((b) => ({
      id: b.id,
      titleTh: (en && b.titleEn) || b.titleTh,
      altText: (en && b.altTextEn) || b.altTextTh,
      image: b.image?.url ?? b.posterUrl ?? "",
      link: b.link,
      mediaType: b.mediaType as HeroBannerItem["mediaType"],
      videoUrl: b.videoUrl,
    }))
    // An image slide needs an image; a video slide needs its video.
    .filter((b) => (b.mediaType === "image" || !b.mediaType ? !!b.image : !!b.videoUrl));

  return {
    items,
    config: config
      ? {
          transitionEffect: config.transitionEffect,
          direction: config.direction,
          transitionSpeedMs: config.transitionSpeedMs,
          displayDurationMs: config.displayDurationMs,
          autoplay: config.autoplay,
          loop: config.loop,
          pauseOnHover: config.pauseOnHover,
          showArrows: config.showArrows,
          showDots: config.showDots,
        }
      : undefined,
  };
}
