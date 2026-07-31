import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BoxIcon } from "@/components/ui/admin-icons";
import { adminProducts } from "@/data/admin-mock";
import { formatThaiDate } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="สินค้า" subtitle={`สินค้าทั้งหมด ${adminProducts.length} รายการ`} />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อสินค้า</th>
              <th className="px-6 py-3 font-medium">SKU</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">แก้ไขล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {adminProducts.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5 font-medium text-slate-800">{product.name}</td>
                <td className="px-6 py-3.5 text-slate-500">{product.sku}</td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={product.status} />
                </td>
                <td className="px-6 py-3.5 text-slate-400">
                  {formatThaiDate(product.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
