import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@/lib/generated/prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { BoxIcon, PlusIcon, ArchiveIcon } from "@/components/ui/admin-icons";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductStatusCell } from "@/components/admin/products/ProductStatusCell";
import { ProductFlagsCell } from "@/components/admin/products/ProductFlagsCell";
import { ProductRowMenu } from "@/components/admin/products/ProductRowMenu";
import { prisma } from "@/lib/prisma";
import { formatCurrencyTHB } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string }>;
}) {
  const { page: pageParam, q, category, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { nameTh: { contains: q, mode: "insensitive" } },
            { nameEn: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
    ...(status ? { status: status as "ACTIVE" | "DRAFT" | "ARCHIVED" } : {}),
  };

  const [products, totalProducts, allCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { category: true, image: true },
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={BoxIcon} title="สินค้า" subtitle={`สินค้าทั้งหมด ${totalProducts} รายการ`} />
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products?status=ARCHIVED"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <ArchiveIcon className="h-4 w-4" />
            ถังขยะ
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
          >
            <PlusIcon className="h-4 w-4" />
            เพิ่มสินค้าใหม่
          </Link>
        </div>
      </div>

      <ProductFilters categories={allCategories} />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ชื่อสินค้า</th>
              <th className="px-6 py-3 font-medium">หมวดหมู่</th>
              <th className="px-6 py-3 font-medium">ราคา</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">แนะนำ/ขายดี</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                      {product.image ? (
                        <Image src={product.image.url} alt={product.nameTh} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-300">
                          —
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-slate-800 hover:text-brand-navy"
                      >
                        {product.nameTh}
                      </Link>
                      <p className="text-xs text-slate-400">{product.nameEn || product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-slate-500">{product.category?.nameTh ?? "—"}</td>
                <td className="px-6 py-3.5 text-slate-500">
                  {product.price != null ? formatCurrencyTHB(product.price) : "—"}
                </td>
                <td className="px-6 py-3.5">
                  <ProductStatusCell id={product.id} status={product.status} />
                </td>
                <td className="px-6 py-3.5">
                  <ProductFlagsCell id={product.id} featured={product.featured} bestSeller={product.bestSeller} />
                </td>
                <td className="px-6 py-3.5">
                  <ProductRowMenu id={product.id} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบสินค้าที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/products" extraParams={{ q, category, status }} />
    </div>
  );
}
