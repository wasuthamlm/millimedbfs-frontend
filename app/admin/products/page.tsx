import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@/lib/generated/prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { BoxIcon, PlusIcon } from "@/components/ui/admin-icons";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductStatusCell } from "@/components/admin/products/ProductStatusCell";
import { ProductFlagsCell } from "@/components/admin/products/ProductFlagsCell";
import { SeoScoreBadge } from "@/components/admin/articles/SeoScoreBadge";
import { BulkActionBar, RowCheckbox, SelectAllCheckbox, SelectionProvider, type BulkAction } from "@/components/admin/list/Selection";
import { InlineText } from "@/components/admin/list/InlineText";
import { TrashToolbar } from "@/components/admin/list/TrashToolbar";
import { TrashRowMenu } from "@/components/admin/list/TrashRowMenu";
import { computeContentAudit } from "@/lib/content-audit";
import { prisma } from "@/lib/prisma";
import { formatCurrencyTHB } from "@/lib/utils";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import {
  activateProducts,
  archiveProducts,
  draftProducts,
  emptyProductTrash,
  purgeProducts,
  renameProduct,
  restoreProducts,
  trashProducts,
} from "@/app/admin/products/actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string; trash?: string }>;
}) {
  const { page: pageParam, q, category, status, trash } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const inTrash = trash === "1";

  const where: Prisma.ProductWhereInput = {
    deletedAt: inTrash ? { not: null } : null,
    AND: [
      q
        ? {
            OR: [
              { nameTh: { contains: q, mode: "insensitive" } },
              { nameEn: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      category ? { OR: [{ categoryId: category }, { subCategoryId: category }] } : {},
    ],
    ...(status && !inTrash ? { status: status as "ACTIVE" | "DRAFT" | "ARCHIVED" } : {}),
  };

  const [products, total, trashCount, allCategories, role] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: inTrash ? { deletedAt: "desc" } : [{ order: "asc" }, { updatedAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { category: true, subCategory: true, image: true, gallery: { select: { url: true }, orderBy: { order: "asc" } } },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { deletedAt: { not: null } } }),
    prisma.productCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { nameTh: "asc" }],
      select: { id: true, nameTh: true },
    }),
    getAdminRole(),
  ]);

  const canPublish = canDo(role, "product.publish");
  const canDelete = canDo(role, "product.delete");
  const editable = canDo(role, "product.edit") && !inTrash;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const bulkActions: BulkAction[] = inTrash
    ? canDelete
      ? [
          { label: "กู้คืน", run: restoreProducts },
          { label: "ลบถาวร", run: purgeProducts, tone: "danger", confirm: "ลบถาวร {n} สินค้า? ไม่สามารถกู้คืนได้" },
        ]
      : []
    : [
        ...(canPublish
          ? [
              { label: "เปิดแสดง", run: activateProducts },
              { label: "เป็นฉบับร่าง", run: draftProducts },
              { label: "ปิดแสดง", run: archiveProducts },
            ]
          : []),
        ...(canDelete ? [{ label: "ย้ายไปถังขยะ", run: trashProducts, tone: "danger" as const, confirm: "ย้าย {n} สินค้าไปถังขยะ?" }] : []),
      ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={BoxIcon} title="สินค้า" subtitle={inTrash ? `ถังขยะ ${trashCount} รายการ` : `สินค้าทั้งหมด ${total} รายการ`} />
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มสินค้าใหม่
        </Link>
      </div>

      <TrashToolbar basePath="/admin/products" inTrash={inTrash} trashCount={trashCount} canDelete={canDelete} onEmpty={emptyProductTrash} />
      <ProductFilters categories={allCategories} />

      <SelectionProvider>
        <BulkActionBar actions={bulkActions} />
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <SelectAllCheckbox ids={products.map((p) => p.id)} />
                </th>
                <th className="px-4 py-3 font-medium">ชื่อสินค้า</th>
                <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                <th className="px-4 py-3 font-medium">ราคา</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">SEO</th>
                <th className="px-4 py-3 font-medium">แนะนำ/ขายดี</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const audit = computeContentAudit({
                  title: product.nameTh,
                  metaTitle: product.seoTitle,
                  metaDesc: product.seoDesc,
                  focusKeyword: product.focusKeyword,
                  bodyHtml: product.descriptionTh,
                  // Same images as the product form, so list and editor show the same score.
                  images: [product.image?.url, ...product.gallery.map((g) => g.url)],
                  faq: null,
                  shortDesc: product.shortDescTh,
                });
                return (
                  <tr key={product.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3.5">
                      <RowCheckbox id={product.id} label={`เลือก ${product.nameTh}`} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                          {product.image ? (
                            <Image src={product.image.url} alt={product.nameTh} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-slate-300">—</div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <InlineText value={product.nameTh} disabled={!editable} onSave={renameProduct.bind(null, product.id, "nameTh")} className="font-medium text-slate-800" />
                          <InlineText
                            value={product.nameEn ?? ""}
                            placeholder={`+ ชื่ออังกฤษ (${product.sku})`}
                            disabled={!editable}
                            onSave={renameProduct.bind(null, product.id, "nameEn")}
                            className="text-xs text-slate-400"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {product.category?.nameTh ?? "—"}
                      {product.subCategory && <span className="block text-xs text-slate-400">› {product.subCategory.nameTh}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {product.price != null ? formatCurrencyTHB(product.price) : "—"}
                      {product.unit && <span className="text-xs text-slate-400"> / {product.unit}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {inTrash || !canPublish ? (
                        <span className="text-xs text-slate-500">{inTrash ? `เดิม: ${product.deletedPrevStatus ?? "-"}` : product.status}</span>
                      ) : (
                        <ProductStatusCell id={product.id} status={product.status} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <SeoScoreBadge score={audit.overall} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ProductFlagsCell id={product.id} featured={product.featured} bestSeller={product.bestSeller} />
                    </td>
                    <td className="px-4 py-3.5">
                      <TrashRowMenu
                        id={product.id}
                        editHref={`/admin/products/${product.id}/edit`}
                        inTrash={inTrash}
                        canDelete={canDelete}
                        onTrash={trashProducts}
                        onRestore={restoreProducts}
                        onPurge={purgeProducts}
                        noun="สินค้า"
                      />
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    {inTrash ? "ถังขยะว่างเปล่า" : "ไม่พบสินค้าที่ตรงกับเงื่อนไข"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SelectionProvider>

      <Pager page={page} totalPages={totalPages} basePath="/admin/products" extraParams={{ q, category, status, trash }} />
    </div>
  );
}
