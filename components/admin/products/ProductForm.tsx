"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { GalleryEditor, type GalleryImage } from "@/components/admin/GalleryEditor";
import { ContentAuditPanel } from "@/components/admin/seo/ContentAuditPanel";
import { EMPTY_SEO, SeoFields, type SeoValue } from "@/components/admin/seo/SeoFields";
import { SparklesIcon, TrashIcon } from "@/components/ui/admin-icons";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { productPath } from "@/lib/public-urls";
import { createProduct, trashProducts, updateProduct, type ProductFormInput } from "@/app/admin/products/actions";
import { aiTranslateFields } from "@/app/admin/ai/actions";

export type InitialProduct = SeoValue & {
  id: string;
  sku: string;
  slug: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  nameTh: string;
  nameEn: string;
  shortDescTh: string;
  shortDescEn: string;
  descriptionTh: string;
  descriptionEn: string;
  imageUrl: string;
  gallery: GalleryImage[];
  categoryId: string;
  subCategoryId: string;
  unit: string;
  price: string;
  featured: boolean;
  bestSeller: boolean;
};

export type ProductCategoryOption = { id: string; nameTh: string; parentId: string | null; slug: string };

const EMPTY_PRODUCT: InitialProduct = {
  ...EMPTY_SEO,
  id: "",
  sku: "",
  slug: "",
  status: "DRAFT",
  nameTh: "",
  nameEn: "",
  shortDescTh: "",
  shortDescEn: "",
  descriptionTh: "",
  descriptionEn: "",
  imageUrl: "",
  gallery: [],
  categoryId: "",
  subCategoryId: "",
  unit: "",
  price: "",
  featured: false,
  bestSeller: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const cardClass = "grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2";

type Tab = "content" | "seo";

export function ProductForm({
  initialProduct,
  categories = [],
  canPublish,
  canDelete,
}: {
  initialProduct?: InitialProduct;
  categories?: ProductCategoryOption[];
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialProduct?.id);
  const [form, setForm] = useState<InitialProduct>(initialProduct ?? EMPTY_PRODUCT);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [translating, startTranslate] = useTransition();

  const update = <K extends keyof InitialProduct>(key: K, value: InitialProduct[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const mainCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId && c.parentId === form.categoryId);
  const categorySlug = categories.find((c) => c.id === form.categoryId)?.slug;
  const path = productPath({ slug: form.slug || "…", sku: form.sku, category: categorySlug ? { slug: categorySlug } : null });

  const translateToEnglish = () =>
    startTranslate(async () => {
      setError(null);
      const res = await aiTranslateFields({
        fields: { name: form.nameTh, shortDesc: form.shortDescTh, description: form.descriptionTh },
        locales: ["en"],
      });
      if (res.error || !res.data) {
        setError(res.error ?? "แปลไม่สำเร็จ");
        return;
      }
      const en = res.data.en;
      setForm((f) => ({
        ...f,
        nameEn: en.name ?? f.nameEn,
        shortDescEn: en.shortDesc ?? f.shortDescEn,
        descriptionEn: en.description ?? f.descriptionEn,
      }));
    });

  const handleSave = async () => {
    setError(null);
    const { id: _id, ...rest } = form;
    void _id;
    const input: ProductFormInput = { ...rest, status: canPublish ? form.status : "DRAFT" };
    const result = isEdit ? await updateProduct(initialProduct!.id, input) : await createProduct(input);
    if ("error" in result && result.error) {
      setError(result.error);
      throw new Error(result.error);
    }
    if (!("id" in result)) return;
    if (isEdit) {
      update("slug", result.slug);
      router.refresh();
    } else {
      router.push(`/admin/products/${result.id}/edit`);
    }
  };

  const handleTrash = async () => {
    if (!isEdit || !window.confirm("ย้ายสินค้านี้ไปถังขยะ? (กู้คืนได้จากถังขยะ)")) return;
    await trashProducts([initialProduct!.id]);
    router.push("/admin/products");
    router.refresh();
  };

  const tabButton = (key: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={cn("rounded-lg px-4 py-2 text-sm font-medium", tab === key ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100")}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      <ContentAuditPanel
        title={form.nameTh}
        metaTitle={form.seoTitle}
        metaDesc={form.seoDesc}
        focusKeyword={form.focusKeyword}
        bodyHtml={form.descriptionTh}
        images={[form.imageUrl, ...form.gallery.map((g) => g.url)]}
        faq={null}
        shortDesc={form.shortDescTh}
      />

      <div className="flex gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
        {tabButton("content", "ข้อมูลสินค้า")}
        {tabButton("seo", "SEO / โซเชียล")}
      </div>

      {tab === "content" && (
        <>
          <div className={cardClass}>
            <div>
              <label className={labelClass}>SKU</label>
              <input className={inputClass} value={form.sku} onChange={(e) => update("sku", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>สถานะ</label>
              <select
                className={inputClass}
                value={canPublish ? form.status : "DRAFT"}
                disabled={!canPublish}
                onChange={(e) => update("status", e.target.value as InitialProduct["status"])}
              >
                <option value="DRAFT">ฉบับร่าง</option>
                <option value="ACTIVE">เปิดแสดง</option>
                <option value="ARCHIVED">ปิดแสดง</option>
              </select>
              {!canPublish && <p className="mt-1 text-xs text-amber-600">Contributor บันทึกได้เฉพาะฉบับร่าง</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>ชื่อสินค้า (ไทย)</label>
              <input
                className={inputClass}
                value={form.nameTh}
                onChange={(e) => {
                  update("nameTh", e.target.value);
                  if (!slugTouched) update("slug", slugify(form.nameEn || e.target.value) || slugify(form.sku));
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>สลัก (URL)</label>
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value.toLowerCase());
                }}
              />
              <p className="mt-1 truncate text-xs text-slate-400">{path}</p>
            </div>
            <div>
              <label className={labelClass}>หมวดหมู่หลัก</label>
              <select
                className={inputClass}
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value, subCategoryId: "" }))}
              >
                <option value="">— ไม่ระบุ —</option>
                {mainCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameTh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>หมวดหมู่ย่อย</label>
              <select className={inputClass} value={form.subCategoryId} disabled={!subCategories.length} onChange={(e) => update("subCategoryId", e.target.value)}>
                <option value="">— ไม่ระบุ —</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameTh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>ราคา (บาท)</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => update("price", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>หน่วย (เช่น ขวด, กล่อง)</label>
              <input className={inputClass} value={form.unit} onChange={(e) => update("unit", e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
                สินค้าแนะนำ
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.bestSeller} onChange={(e) => update("bestSeller", e.target.checked)} />
                สินค้าขายดี
              </label>
            </div>
            <div className="sm:col-span-2">
              <ImageUploader label="รูปภาพหลัก" value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
            </div>
            <div className="sm:col-span-2">
              <GalleryEditor value={form.gallery} onChange={(g) => update("gallery", g)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>คำโปรยสั้น (ไทย)</label>
              <textarea rows={2} className={inputClass} value={form.shortDescTh} onChange={(e) => update("shortDescTh", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>รายละเอียด (ไทย)</label>
              <RichTextEditor value={form.descriptionTh} onChange={(html) => update("descriptionTh", html)} />
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between sm:col-span-2">
              <h3 className="text-sm font-semibold text-slate-800">ภาษาอังกฤษ</h3>
              <button
                type="button"
                onClick={translateToEnglish}
                disabled={translating || !form.nameTh}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                {translating ? "กำลังแปล..." : "แปลจากภาษาไทยด้วย AI"}
              </button>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>ชื่อสินค้า (อังกฤษ)</label>
              <input className={inputClass} value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>คำโปรยสั้น (อังกฤษ)</label>
              <textarea rows={2} className={inputClass} value={form.shortDescEn} onChange={(e) => update("shortDescEn", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>รายละเอียด (อังกฤษ)</label>
              <RichTextEditor value={form.descriptionEn} onChange={(html) => update("descriptionEn", html)} />
            </div>
          </div>
        </>
      )}

      {tab === "seo" && (
        <SeoFields
          value={form}
          onChange={(seo) => setForm((f) => ({ ...f, ...seo }))}
          context={{ title: form.nameTh, body: `${form.shortDescTh} ${form.descriptionTh}` }}
          path={path}
          coverImageUrl={form.imageUrl}
        />
      )}

      <div className="flex items-center justify-between">
        <SaveButton label={isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างสินค้า"} onSave={handleSave} />
        {isEdit && canDelete && (
          <button
            type="button"
            onClick={handleTrash}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            ย้ายไปถังขยะ
          </button>
        )}
      </div>
    </div>
  );
}
