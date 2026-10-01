import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { RocketIcon } from "@/components/ui/admin-icons";
import { LandingListClient } from "@/components/admin/landing/LandingListClient";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const metadata: Metadata = { title: "Landing Pages" };
export const dynamic = "force-dynamic";

export default async function AdminLandingPagesRoute({ searchParams }: PageProps<"/admin/landing">) {
  const sp = await searchParams;
  const inTrash = sp.trash === "1";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [rows, trashCount, role] = await Promise.all([
    prisma.landingPage.findMany({
      where: {
        deletedAt: inTrash ? { not: null } : null,
        ...(q
          ? { OR: [{ titleTh: { contains: q, mode: "insensitive" } }, { titleEn: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, slug: true, titleTh: true, titleEn: true, status: true, updatedAt: true, _count: { select: { sections: true } } },
    }),
    prisma.landingPage.count({ where: { deletedAt: { not: null } } }),
    getAdminRole(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={RocketIcon}
        title={`Landing Pages (${rows.length})`}
        subtitle="หน้าแคมเปญแบบแยกเดี่ยว ที่ /lp/ชื่อหน้า — มี Header, Footer และ Widget ของตัวเอง ไม่ใช้ของเว็บหลัก"
      />
      <LandingListClient
        rows={rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          titleTh: r.titleTh,
          titleEn: r.titleEn ?? "",
          status: r.status,
          sectionCount: r._count.sections,
          updatedAt: r.updatedAt.toISOString(),
        }))}
        inTrash={inTrash}
        trashCount={trashCount}
        query={q}
        canCreate={canDo(role, "page.create")}
        canEdit={canDo(role, "page.edit")}
        canPublish={canDo(role, "page.publish")}
        canDelete={canDo(role, "page.delete")}
      />
    </div>
  );
}
