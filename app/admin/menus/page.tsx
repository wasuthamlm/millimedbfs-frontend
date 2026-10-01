import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListIconGlyph } from "@/components/ui/admin-icons";
import { MenuManager, type MenuNode } from "@/components/admin/menus/MenuManager";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const metadata: Metadata = { title: "เมนูเว็บไซต์" };
export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const rows = await prisma.navLink.findMany({
    where: { placement: "HEADER" },
    orderBy: { order: "asc" },
  });

  const byParent = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const key = row.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }

  function buildTree(parentId: string | null): MenuNode[] {
    return (byParent.get(parentId) ?? []).map((row) => ({
      id: row.id,
      labelTh: row.labelTh,
      labelEn: row.labelEn,
      href: row.href,
      active: row.active,
      parentId: row.parentId,
      openInNewTab: row.openInNewTab,
      children: buildTree(row.id),
    }));
  }

  const tree = buildTree(null);
  const role = await getAdminRole();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ListIconGlyph} title="Menu Manager" subtitle="จัดการเมนูนำทางของเว็บไซต์แบบหลายระดับ" />
      <MenuManager
        initialTree={tree}
        canDelete={canDo(role, "menu.delete")}
        canReorderTop={canDo(role, "menu.reorder-top")}
      />
    </div>
  );
}
