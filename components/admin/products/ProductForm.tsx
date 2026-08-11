"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SeoScorePanel } from "@/components/admin/seo/SeoScorePanel";
import { TrashIcon } from "@/components/ui/admin-icons";
import { calculateSeoAeoGeo, productToScoreInput } from "@/lib/seo-score";
import { SITE_URL } from "@/lib/site";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductFormInput,
} from "@/app/admin/products/actions";

export type InitialProduct = {
  id: string;
  sku: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  imageUrl: string;
  categoryId: string;
  price: string;
  featured: boolean;
  bestSeller: boolean;
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
};

export type ProductCategoryOption = { id: string; nameTh: string; parentId: string | null };

const EMPTY_PRODUCT: InitialProduct = {
  id: "",
  sku: "",
  status: "DRAFT",
  nameTh: "",
  nameEn: "",
  descriptionTh: "",
  descriptionEn: "",
  imageUrl: "",
  categoryId: "",
  price: "",
  featured: false,
  bestSeller: false,
  seoTitle: "",
  seoDesc: "",
  seoTitleEn: "",
  seoDescEn: "",
  seoNoIndex: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function ProductForm({
  initialProduct,
  categories = [],
}: {
  initialProduct?: InitialProduct;
  categories?: ProductCategoryOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initialProduct?.id);
  const [form, setForm] = useState<InitialProduct>(initialProduct ?? EMPTY_PRODUCT);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof InitialProduct>(key: K, value: InitialProduct[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const seoResult = useMemo(
    () =>
      calculateSeoAeoGeo(
        productToScoreInput({
          nameTh: form.nameTh,
          nameEn: form.nameEn,
          seoTitle: form.seoTitle,
          seoTitleEn: form.seoTitleEn,
          seoDesc: form.seoDesc,
          seoDescEn: form.seoDescEn,
          descriptionTh: form.descriptionTh,
          sku: form.sku,
          hasImage: Boolean(form.imageUrl),
        }),
      ),
    [
      form.nameTh,
      form.nameEn,
      form.seoTitle,
      form.seoTitleEn,
      form.seoDesc,
      form.seoDescEn,
      form.descriptionTh,
      form.sku,
      form.imageUrl,
    ],
  );

  const handleSave = async () => {
    setError(null);
    const input: ProductFormInput = {
      sku: form.sku,
      status: form.status,
      nameTh: form.nameTh,
      nameEn: form.nameEn,
      descriptionTh: form.descriptionTh,
      descriptionEn: form.descriptionEn,
      imageUrl: form.imageUrl,
      categoryId: form.categoryId,
      price: form.price,
      featured: form.featured,
      bestSeller: form.bestSeller,
      seoTitle: form.seoTitle,
      seoDesc: form.seoDesc,
      seoTitleEn: form.seoTitleEn,
      seoDescEn: form.seoDescEn,
      seoNoIndex: form.seoNoIndex,
    };

    const result = isEdit
      ? await updateProduct(initialProduct!.id, input)
      : await createProduct(input);
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }

    router.push("/admin/products");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm("ยืนยันการลบสินค้านี้?")) return;
    const result = await deleteProduct(initialProduct!.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label className={labelClass}>SKU</label>
          <input className={inputClass} value={form.sku} onChange={(e) => update("sku", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>สถานะ</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => update("status", e.target.value as InitialProduct["status"])}
          >
            <option value="ACTIVE">เปิดใช้งาน</option>
            <option value="DRAFT">ฉบับร่าง</option>
            <option value="ARCHIVED">เก็บถาวร</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>หมวดหมู่</label>
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">— ไม่ระบุ —</option>
            {categories
              .filter((c) => !c.parentId)
              .flatMap((parent) => [
                parent,
                ...categories.filter((c) => c.parentId === parent.id),
              ])
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `— ${c.nameTh}` : c.nameTh}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>ราคา (บาท)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>

        <div className="flex items-end gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-navy"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            สินค้าแนะนำ (Featured)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-navy"
              checked={form.bestSeller}
              onChange={(e) => update("bestSeller", e.target.checked)}
            />
            ขายดี (Best Seller)
          </label>
        </div>

        <div>
          <label className={labelClass}>ชื่อสินค้า (ไทย)</label>
          <input
            className={inputClass}
            value={form.nameTh}
            onChange={(e) => update("nameTh", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>ชื่อสินค้า (อังกฤษ)</label>
          <input
            className={inputClass}
            value={form.nameEn}
            onChange={(e) => update("nameEn", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <ImageUploader
            label="รูปภาพสินค้า"
            value={form.imageUrl}
            onChange={(url) => update("imageUrl", url)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>รายละเอียด (ไทย)</label>
          <textarea
            className={inputClass}
            rows={4}
            value={form.descriptionTh}
            onChange={(e) => update("descriptionTh", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>รายละเอียด (อังกฤษ)</label>
          <textarea
            className={inputClass}
            rows={4}
            value={form.descriptionEn}
            onChange={(e) => update("descriptionEn", e.target.value)}
          />
        </div>
      </div>

      <SeoScorePanel result={seoResult} />

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
        <h3 className="sm:col-span-2 text-sm font-semibold text-slate-800">SEO</h3>
        <div>
          <label className={labelClass}>Meta Title (TH)</label>
          <input
            className={inputClass}
            value={form.seoTitle}
            onChange={(e) => update("seoTitle", e.target.value)}
            maxLength={70}
            placeholder={form.nameTh || "ค่าเริ่มต้น: ใช้ชื่อสินค้า"}
          />
          <p className="mt-1 text-xs text-slate-400">{form.seoTitle.length}/70 ตัวอักษร</p>
        </div>
        <div>
          <label className={labelClass}>Meta Title (EN)</label>
          <input
            className={inputClass}
            value={form.seoTitleEn}
            onChange={(e) => update("seoTitleEn", e.target.value)}
            maxLength={70}
          />
        </div>
        <div>
          <label className={labelClass}>Meta Description (TH)</label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.seoDesc}
            onChange={(e) => update("seoDesc", e.target.value)}
            maxLength={200}
            placeholder={form.descriptionTh || "ค่าเริ่มต้น: ใช้รายละเอียดสินค้า"}
          />
          <p className="mt-1 text-xs text-slate-400">{form.seoDesc.length}/200 ตัวอักษร</p>
        </div>
        <div>
          <label className={labelClass}>Meta Description (EN)</label>
          <textarea
            className={inputClass}
            rows={3}
            value={form.seoDescEn}
            onChange={(e) => update("seoDescEn", e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-600">Advanced SEO</p>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.seoNoIndex}
              onChange={(e) => update("seoNoIndex", e.target.checked)}
            />
            ไม่ให้ Google จัดทำดัชนี (noindex)
          </label>
        </div>

        <div className="sm:col-span-2 border-t border-slate-100 pt-4">
          <p className="mb-1 text-xs font-medium text-slate-500">Canonical URL</p>
          <p className="truncate text-sm text-slate-600">
            {`${SITE_URL}/products/${form.id || "…"}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SaveButton label={isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างสินค้า"} onSave={handleSave} />
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            ลบสินค้า
          </button>
        )}
      </div>
    </div>
  );
}
