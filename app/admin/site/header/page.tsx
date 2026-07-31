import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { GlobeIcon } from "@/components/ui/admin-icons";
import { HeaderManager } from "@/components/admin/site/HeaderManager";

export const metadata: Metadata = { title: "จัดการ Header" };

export default function AdminHeaderPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={GlobeIcon} title="จัดการ Header" subtitle="แก้ไขเมนูนำทางที่แสดงบน Navbar ของหน้าเว็บ" />
      <HeaderManager />
    </div>
  );
}
