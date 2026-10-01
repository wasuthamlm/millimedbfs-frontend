import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageIcon } from "@/components/ui/admin-icons";
import { BannersManager } from "@/components/admin/site/BannersManager";
import { BannerAppearanceForm } from "@/components/admin/site/BannerAppearanceForm";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import { getLinkOptions } from "@/lib/link-options";
import type { Banner } from "@/data/admin-banners";
import type { BannerConfigInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const [rows, config, linkOptions, role] = await Promise.all([
    prisma.banner.findMany({ orderBy: { order: "asc" }, include: { image: true } }),
    prisma.siteBannerConfig.findUnique({ where: { id: "singleton" } }),
    getLinkOptions(),
    getAdminRole(),
  ]);

  const initialBanners: Banner[] = rows.map((row) => ({
    id: row.id,
    titleTh: row.titleTh,
    titleEn: row.titleEn ?? "",
    altTextTh: row.altTextTh ?? "",
    altTextEn: row.altTextEn ?? "",
    captionTh: row.captionTh ?? "",
    captionEn: row.captionEn ?? "",
    image: row.image?.url ?? row.posterUrl ?? "",
    link: row.link ?? "",
    order: row.order,
    active: row.active,
    mediaType: row.mediaType as Banner["mediaType"],
    videoUrl: row.videoUrl ?? "",
  }));

  const initialConfig: BannerConfigInput = {
    transitionEffect: "fade",
    direction: config?.direction ?? "ltr",
    transitionSpeedMs: config?.transitionSpeedMs ?? 500,
    displayDurationMs: config?.displayDurationMs ?? 5000,
    autoplay: config?.autoplay ?? false,
    loop: config?.loop ?? true,
    pauseOnHover: config?.pauseOnHover ?? true,
    showArrows: config?.showArrows ?? true,
    showDots: config?.showDots ?? true,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={ImageIcon}
        title={`จัดการ Banners (${initialBanners.length} แบนเนอร์)`}
        subtitle="จัดการภาพแบนเนอร์ที่แสดงในส่วน Hero ของหน้าแรก (กดเปลี่ยนภาพได้ พร้อมรูปย่อด้านล่าง)"
      />
      <BannerAppearanceForm initial={initialConfig} />
      <BannersManager
        initialBanners={initialBanners}
        initialStatus={config?.status ?? "PUBLISHED"}
        canPublish={canDo(role, "banner.publish")}
        linkOptions={linkOptions}
      />
    </div>
  );
}
