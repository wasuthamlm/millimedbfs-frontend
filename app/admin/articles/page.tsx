import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FileTextIcon } from "@/components/ui/admin-icons";
import { adminAllArticles, adminStats } from "@/data/admin-mock";
import { formatThaiDate } from "@/lib/utils";

export default function AdminArticlesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={FileTextIcon}
        title="บทความ"
        subtitle={`บทความทั้งหมด ${adminStats.totalArticles} รายการ • เผยแพร่แล้ว ${adminStats.publishedArticles}`}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
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
            {adminAllArticles.map((article) => (
              <tr key={article.id} className="border-b border-slate-50 last:border-0">
                <td className="max-w-md truncate px-6 py-3.5 font-medium text-slate-800">
                  {article.title}
                </td>
                <td className="px-6 py-3.5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                    {article.type}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-6 py-3.5 text-slate-400">
                  {formatThaiDate(article.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
