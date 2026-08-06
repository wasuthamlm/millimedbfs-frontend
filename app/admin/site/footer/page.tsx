import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListIconGlyph } from "@/components/ui/admin-icons";
import { FooterManager } from "@/components/admin/site/FooterManager";
import { prisma } from "@/lib/prisma";
import type { FooterColumn } from "@/data/admin-footer";
import type { FooterThemeInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Footer" };
export const dynamic = "force-dynamic";

export default async function AdminFooterPage() {
  const [columnRows, contactRow, config] = await Promise.all([
    prisma.footerColumn.findMany({
      orderBy: { order: "asc" },
      include: { links: { orderBy: { order: "asc" } } },
    }),
    prisma.footerContact.findUnique({ where: { id: "singleton" } }),
    prisma.footerConfig.findUnique({ where: { id: "singleton" } }),
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

  const initialTheme: FooterThemeInput = {
    bgColor: config?.bgColor ?? "#032f87",
    textColor: config?.textColor ?? "#ffffff",
    accentColor: config?.accentColor ?? "#fed22f",
    desktopColumns: config?.desktopColumns ?? 3,
    copyrightTh: config?.copyrightTh ?? "",
    copyrightEn: config?.copyrightEn ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ListIconGlyph} title="จัดการ Footer" subtitle="แก้ไขข้อมูล บล็อก ข้อมูลติดต่อ และลิงก์ด้านล่างของเว็บไซต์ทุกหน้า" />
      <FooterManager initialColumns={initialColumns} initialContact={initialContact} initialTheme={initialTheme} />
    </div>
  );
}
