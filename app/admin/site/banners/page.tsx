import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageIcon } from "@/components/ui/admin-icons";
import { BannersManager } from "@/components/admin/site/BannersManager";
import { BannerAppearanceForm } from "@/components/admin/site/BannerAppearanceForm";
import { prisma } from "@/lib/prisma";
import type { Banner } from "@/data/admin-banners";
import type { BannerConfigInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const [rows, config] = await Promise.all([
    prisma.banner.findMany({ orderBy: { order: "asc" }, include: { image: true } }),
    prisma.siteBannerConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  const initialBanners: Banner[] = rows.map((row) => ({
    id: row.id,
    titleTh: row.titleTh,
    image: row.image?.url ?? "/images/news/expo-2025.svg",
    link: row.link ?? "/",
    order: row.order,
    active: row.active,
  }));

  const initialConfig: BannerConfigInput = {
    transitionEffect: config?.transitionEffect ?? "fade",
    direction: config?.direction ?? "ltr",
    transitionSpeedMs: config?.transitionSpeedMs ?? 700,
    displayDurationMs: config?.displayDurationMs ?? 5000,
    autoplay: config?.autoplay ?? true,
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
        subtitle="จัดการภาพสไลด์ที่แสดงในส่วน Hero Banners ของหน้าแรก"
      />
      <BannerAppearanceForm initial={initialConfig} />
      <BannersManager initialBanners={initialBanners} />
    </div>
  );
}
