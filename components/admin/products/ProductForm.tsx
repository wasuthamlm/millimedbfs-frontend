"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TrashIcon } from "@/components/ui/admin-icons";
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
};

const EMPTY_PRODUCT: InitialProduct = {
  id: "",
  sku: "",
  status: "DRAFT",
  nameTh: "",
  nameEn: "",
  descriptionTh: "",
  descriptionEn: "",
  imageUrl: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function ProductForm({ initialProduct }: { initialProduct?: InitialProduct }) {
  const router = useRouter();
  const isEdit = Boolean(initialProduct?.id);
  const [form, setForm] = useState<InitialProduct>(initialProduct ?? EMPTY_PRODUCT);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof InitialProduct>(key: K, value: InitialProduct[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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
