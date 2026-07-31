import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListIconGlyph } from "@/components/ui/admin-icons";
import { FooterManager } from "@/components/admin/site/FooterManager";

export const metadata: Metadata = { title: "จัดการ Footer" };

export default function AdminFooterPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ListIconGlyph} title="จัดการ Footer" subtitle="แก้ไขคอลัมน์ลิงก์และข้อมูลติดต่อที่แสดงใน Footer" />
      <FooterManager />
    </div>
  );
}
