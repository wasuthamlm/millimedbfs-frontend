import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListIconGlyph } from "@/components/ui/admin-icons";
import { FooterManager } from "@/components/admin/site/FooterManager";
import { prisma } from "@/lib/prisma";
import type { FooterColumn } from "@/data/admin-footer";

export const metadata: Metadata = { title: "จัดการ Footer" };
export const dynamic = "force-dynamic";

export default async function AdminFooterPage() {
  const [columnRows, contactRow] = await Promise.all([
    prisma.footerColumn.findMany({
      orderBy: { order: "asc" },
      include: { links: { orderBy: { order: "asc" } } },
    }),
    prisma.footerContact.findUnique({ where: { id: "singleton" } }),
  ]);

  const initialColumns: FooterColumn[] = columnRows.map((col) => ({
    id: col.id,
    title: col.title,
    links: col.links.map((link) => ({ id: link.id, label: link.label, href: link.href })),
  }));

  const initialContact = {
    phone: contactRow?.phone ?? "",
    email: contactRow?.email ?? "",
    address: contactRow?.address ?? "",
    tagline: contactRow?.tagline ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ListIconGlyph} title="จัดการ Footer" subtitle="แก้ไขคอลัมน์ลิงก์และข้อมูลติดต่อที่แสดงใน Footer" />
      <FooterManager initialColumns={initialColumns} initialContact={initialContact} />
    </div>
  );
}
