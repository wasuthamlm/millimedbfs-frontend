import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pager } from "@/components/admin/Pager";
import { BoxIcon, PlusIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.product.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={BoxIcon} title="สินค้า" subtitle={`สินค้าทั้งหมด ${totalProducts} รายการ`} />
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มสินค้าใหม่
        </Link>
      </div>

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
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5 font-medium text-slate-800">
                  <Link href={`/admin/products/${product.id}/edit`} className="hover:text-brand-navy">
                    {product.nameTh}
                  </Link>
                </td>
                <td className="px-6 py-3.5 text-slate-500">{product.sku}</td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={product.status} />
                </td>
                <td className="px-6 py-3.5 text-slate-400">
                  {formatThaiDate(product.updatedAt.toISOString())}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  ยังไม่มีสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/products" />
    </div>
  );
}
