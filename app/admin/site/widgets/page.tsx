import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsIcon } from "@/components/ui/admin-icons";
import { WidgetsManager } from "@/components/admin/site/WidgetsManager";

export const metadata: Metadata = { title: "จัดการ Widgets" };

export default function AdminWidgetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={SettingsIcon} title="จัดการ Widgets" subtitle="เปิด/ปิดวิดเจ็ตเสริมที่แสดงบนหน้าเว็บสาธารณะ" />
      <WidgetsManager />
    </div>
  );
}
