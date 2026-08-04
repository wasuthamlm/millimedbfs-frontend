import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageIcon } from "@/components/ui/admin-icons";
import { BannersManager } from "@/components/admin/site/BannersManager";
import { prisma } from "@/lib/prisma";
import type { Banner } from "@/data/admin-banners";

export const metadata: Metadata = { title: "จัดการ Banners" };
export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const rows = await prisma.banner.findMany({ orderBy: { order: "asc" }, include: { image: true } });

  const initialBanners: Banner[] = rows.map((row) => ({
    id: row.id,
    titleTh: row.titleTh,
    image: row.image?.url ?? "/images/news/expo-2025.svg",
    link: row.link ?? "/",
    order: row.order,
    active: row.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ImageIcon} title="จัดการ Banners" subtitle="จัดการภาพสไลด์ที่แสดงในส่วน Hero Banners ของหน้าแรก" />
      <BannersManager initialBanners={initialBanners} />
    </div>
  );
}
