import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageIcon } from "@/components/ui/admin-icons";
import { BannersManager } from "@/components/admin/site/BannersManager";

export const metadata: Metadata = { title: "จัดการ Banners" };

export default function AdminBannersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ImageIcon} title="จัดการ Banners" subtitle="จัดการภาพสไลด์ที่แสดงในส่วน Hero Banners ของหน้าแรก" />
      <BannersManager />
    </div>
  );
}
