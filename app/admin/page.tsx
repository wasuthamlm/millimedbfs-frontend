import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GridIcon, BoxIcon, FileTextIcon, MailIcon, ClockIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/utils";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [session, totalProducts, totalArticles, publishedArticles, pendingApproval, latestArticles] =
    await Promise.all([
      auth(),
      prisma.product.count(),
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.findMany({ take: 5, orderBy: { updatedAt: "desc" } }),
    ]);

  const unreadMessages = 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        icon={GridIcon}
        title="Dashboard"
        subtitle={`ยินดีต้อนรับ, ${session?.user?.email ?? ""}`}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BoxIcon}
          label="สินค้าทั้งหมด"
          value={totalProducts}
          caption="ทุก status"
        />
        <StatCard
          icon={FileTextIcon}
          label="บทความทั้งหมด"
          value={totalArticles}
          caption={`เผยแพร่แล้ว ${publishedArticles} บทความ`}
        />
        <StatCard
          icon={ClockIcon}
          label="รายการรออนุมัติ"
          value={pendingApproval}
          caption="ฉบับร่างที่ยังไม่อนุมัติ"
          tone="gold"
        />
        <StatCard
          icon={MailIcon}
          label="ข้อความที่ยังไม่อ่าน"
          value={unreadMessages}
          caption="จากผู้เยี่ยมชม"
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">บทความล่าสุด</h2>
          <Link
            href="/admin/articles"
            className="text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
          >
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
                    {post.titleTh}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                      {post.kind === "ARTICLE" ? "article" : "news"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-400">
                    {formatThaiDate(post.updatedAt.toISOString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
