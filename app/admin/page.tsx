import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GridIcon, BoxIcon, FileTextIcon, MailIcon, ClockIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    session,
    totalProducts,
    activeProducts,
    totalArticles,
    publishedArticles,
    draftPosts,
    draftProducts,
    draftPopups,
    unreadMessages,
    latestArticles,
  ] = await Promise.all([
    auth(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.post.count({ where: { deletedAt: null, status: "DRAFT" } }),
    prisma.product.count({ where: { deletedAt: null, status: "DRAFT" } }),
    prisma.popup.count({ where: { deletedAt: null, status: "DRAFT" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.post.findMany({
      where: { deletedAt: null },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { articleCategory: { select: { nameTh: true } } },
    }),
  ]);

  const role = await getAdminRole();
  const pending = draftPosts + draftProducts + draftPopups;
  const pendingBreakdown = [
    { label: "บทความ", count: draftPosts, href: "/admin/articles?status=DRAFT" },
    { label: "สินค้า", count: draftProducts, href: "/admin/products?status=DRAFT" },
    { label: "Popup", count: draftPopups, href: "/admin/site/popup" },
  ].filter((p) => p.count > 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader icon={GridIcon} title="Dashboard" subtitle={`ยินดีต้อนรับ, ${session?.user?.name || session?.user?.email || ""}`} />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/products" className="rounded-2xl transition-shadow hover:shadow-md">
          <StatCard icon={BoxIcon} label="สินค้าทั้งหมด" value={totalProducts} caption={`เปิดขาย ${activeProducts} รายการ`} />
        </Link>
        <Link href="/admin/articles" className="rounded-2xl transition-shadow hover:shadow-md">
          <StatCard icon={FileTextIcon} label="บทความทั้งหมด" value={totalArticles} caption={`เผยแพร่แล้ว ${publishedArticles} บทความ`} />
        </Link>
        <div className="flex flex-col">
          <StatCard icon={ClockIcon} label="รายการรออนุมัติ" value={pending} caption="ฉบับร่างที่ยังไม่เผยแพร่" tone="gold" />
          {pendingBreakdown.length > 0 && (
            <div className="-mt-3 flex flex-wrap gap-2 rounded-b-2xl border border-t-0 border-slate-100 bg-white px-5 pb-4 pt-4 text-xs">
              {pendingBreakdown.map((p) => (
                <Link key={p.label} href={p.href} className="rounded-full bg-brand-gold/15 px-2.5 py-1 font-medium text-brand-gold-dark hover:bg-brand-gold/25">
                  {p.label} {p.count}
                </Link>
              ))}
            </div>
          )}
        </div>
        {canDo(role, "contact.read") && (
          <Link href="/admin/messages?filter=unread" className="rounded-2xl transition-shadow hover:shadow-md">
            <StatCard
              icon={MailIcon}
              label="ข้อความที่ยังไม่อ่าน"
              value={unreadMessages}
              caption="จากผู้เยี่ยมชม"
              tone={unreadMessages > 0 ? "gold" : "navy"}
            />
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">บทความล่าสุด</h2>
          <Link href="/admin/articles" className="text-sm font-medium text-brand-navy hover:text-brand-gold-dark">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">ชื่อบทความ</th>
                <th className="px-6 py-3 font-medium">ประเภท</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 font-medium">แก้ไขล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {latestArticles.map((post) => (
                <tr key={post.id} className="border-b border-slate-50 last:border-0">
                  <td className="max-w-xs truncate px-6 py-3.5 font-medium text-slate-800">
                    <Link href={`/admin/articles/${post.id}/edit`} className="hover:text-brand-navy">
                      {post.titleTh}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {post.articleCategory?.nameTh ?? (post.kind === "ARTICLE" ? "บทความ" : "ข่าว")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">{formatThaiDate(post.updatedAt.toISOString())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
