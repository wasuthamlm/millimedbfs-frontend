import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsIcon } from "@/components/ui/admin-icons";
import { WidgetsManager } from "@/components/admin/site/WidgetsManager";
import { prisma } from "@/lib/prisma";
import { FloatingWidgetsManager } from "@/components/admin/site/FloatingWidgetsManager";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import type { Widget } from "@/data/admin-widgets";

export const metadata: Metadata = { title: "จัดการ Widgets" };
export const dynamic = "force-dynamic";

export default async function AdminWidgetsPage() {
  const [rows, floats, role] = await Promise.all([
    prisma.widget.findMany({ where: { type: null }, orderBy: { name: "asc" } }),
    prisma.widget.findMany({ where: { type: { not: null } }, orderBy: { order: "asc" } }),
    getAdminRole(),
  ]);

  const initialWidgets: Widget[] = rows.map((row) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description ?? "",
    enabled: row.enabled,
    link: row.link ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={SettingsIcon} title="จัดการ Widgets" subtitle="เปิด/ปิดวิดเจ็ตเสริมที่แสดงบนหน้าเว็บสาธารณะ" />
      <WidgetsManager initialWidgets={initialWidgets} />
      <FloatingWidgetsManager
        canDelete={canDo(role, "widget.delete")}
        widgets={floats.map((w) => ({
          id: w.id,
          labelTh: w.labelTh ?? w.name,
          labelEn: w.labelEn,
          type: w.type ?? "url",
          icon: w.icon ?? "external-link",
          link: w.link,
          phone: w.phone,
          position: w.position,
          design: w.design,
          color: w.color,
          openInNewTab: w.openInNewTab,
          enabled: w.enabled,
        }))}
      />
    </div>
  );
}
