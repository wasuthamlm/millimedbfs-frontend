import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { GlobeIcon, ListIconGlyph } from "@/components/ui/admin-icons";
import { HeaderAppearanceForm } from "@/components/admin/site/HeaderAppearanceForm";
import { prisma } from "@/lib/prisma";
import type { NavLink } from "@/data/nav";
import type { HeaderConfigInput } from "./actions";

export const metadata: Metadata = { title: "จัดการ Header" };
export const dynamic = "force-dynamic";

export default async function AdminHeaderPage() {
  const [rows, config] = await Promise.all([
    prisma.navLink.findMany({
      where: { placement: "HEADER" },
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    }),
    prisma.siteHeaderConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  const initialLinks: NavLink[] = rows
    .filter((row) => !row.parentId)
    .map((row) => ({
      label: row.labelTh,
      href: row.href,
      children: row.children.length
        ? row.children.map((child) => ({ label: child.labelTh, href: child.href }))
        : undefined,
    }));

  const initialConfig: HeaderConfigInput = {
    layout: config?.layout ?? "logo-left-menu-center",
    height: config?.height ?? "standard",
    shadow: config?.shadow ?? "strong",
    position: config?.position ?? "fixed-top",
    bgColor: config?.bgColor ?? "#032f87",
    textColor: config?.textColor ?? "#ffffff",
    hoverBgColor: config?.hoverBgColor ?? "#fed22f",
    hoverTextColor: config?.hoverTextColor ?? "#000000",
    activeBgColor: config?.activeBgColor ?? "#fed22f",
    activeTextColor: config?.activeTextColor ?? "#000000",
    iconTextColor: config?.iconTextColor ?? "#fed22f",
    logoMode: config?.logoMode ?? "site-settings",
    logoTextTh: config?.logoTextTh ?? "",
    logoTextEn: config?.logoTextEn ?? "",
    menuWrap: config?.menuWrap ?? "single-line",
    menuFontSize: config?.menuFontSize ?? "normal",
    menuLevels: config?.menuLevels ?? 2,
    submenuStyle: config?.submenuStyle ?? "click-open",
    submenuChildBehavior: config?.submenuChildBehavior ?? "below-parent",
    showSearch: config?.showSearch ?? false,
    showLanguage: config?.showLanguage ?? true,
    showAccount: config?.showAccount ?? false,
    showCart: config?.showCart ?? false,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={GlobeIcon}
        title="จัดการ Header"
        subtitle="ปรับค่าด้านซ้าย แล้วดูผลแบบคลิกทดสอบได้ใน Live Preview"
      />
      <HeaderAppearanceForm initial={initialConfig} navLinks={initialLinks} />

      <Link
        href="/admin/menus"
        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors hover:border-brand-navy/30"
      >
        <div className="flex items-center gap-3">
          <ListIconGlyph className="h-5 w-5 text-brand-navy" />
          <div>
            <p className="text-sm font-semibold text-slate-800">แก้ไขรายการเมนู</p>
            <p className="text-xs text-slate-400">เพิ่ม/ลบ/จัดลำดับเมนูแบบหลายระดับได้ที่หน้า Menu Manager</p>
          </div>
        </div>
        <span className="text-sm font-medium text-brand-navy">ไปที่ Menu Manager →</span>
      </Link>
    </div>
  );
}
