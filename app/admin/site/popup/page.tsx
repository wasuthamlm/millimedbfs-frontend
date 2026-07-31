import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Share2Icon } from "@/components/ui/admin-icons";
import { PopupManager } from "@/components/admin/site/PopupManager";

export const metadata: Metadata = { title: "จัดการ Popup" };

export default function AdminPopupPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Share2Icon} title="จัดการ Popup" subtitle="ตั้งค่า Popup ประชาสัมพันธ์ที่แสดงบนหน้าเว็บสาธารณะ" />
      <PopupManager />
    </div>
  );
}
