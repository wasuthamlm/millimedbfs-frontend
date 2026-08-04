import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { GlobeIcon } from "@/components/ui/admin-icons";
import { HeaderManager } from "@/components/admin/site/HeaderManager";
import { prisma } from "@/lib/prisma";
import type { NavLink } from "@/data/nav";

export const metadata: Metadata = { title: "จัดการ Header" };
export const dynamic = "force-dynamic";

export default async function AdminHeaderPage() {
  const rows = await prisma.navLink.findMany({
    where: { placement: "HEADER" },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });

  const initialLinks: NavLink[] = rows
    .filter((row) => !row.parentId)
    .map((row) => ({
      label: row.labelTh,
      href: row.href,
      children: row.children.length
        ? row.children.map((child) => ({ label: child.labelTh, href: child.href }))
        : undefined,
    }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={GlobeIcon} title="จัดการ Header" subtitle="แก้ไขเมนูนำทางที่แสดงบน Navbar ของหน้าเว็บ" />
      <HeaderManager initialLinks={initialLinks} />
    </div>
  );
}
