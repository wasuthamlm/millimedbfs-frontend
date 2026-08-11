"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SeoScorePanel } from "@/components/admin/seo/SeoScorePanel";
import { TrashIcon } from "@/components/ui/admin-icons";
import { slugify } from "@/lib/slugify";
import { calculateSeoAeoGeo, postToScoreInput } from "@/lib/seo-score";
import { SITE_URL } from "@/lib/site";
import {
  createPost,
  deletePost,
  updatePost,
  type PostFormInput,
} from "@/app/admin/articles/actions";

export type InitialPost = {
  id: string;
  kind: "ARTICLE" | "NEWS";
  status: "DRAFT" | "PUBLISHED";
  slug: string;
  titleTh: string;
  titleEn: string;
  excerptTh: string;
  excerptEn: string;
  bodyTh: string;
  bodyEn: string;
  categoryId: string;
  featured: boolean;
  coverImageUrl: string;
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
};

export type ArticleCategoryOption = { id: string; nameTh: string };

const EMPTY_POST: InitialPost = {
  id: "",
  kind: "ARTICLE",
  status: "DRAFT",
  slug: "",
  titleTh: "",
  titleEn: "",
  excerptTh: "",
  excerptEn: "",
  bodyTh: "",
  bodyEn: "",
  categoryId: "",
  featured: false,
  coverImageUrl: "",
  seoTitle: "",
  seoDesc: "",
  seoTitleEn: "",
  seoDescEn: "",
  seoNoIndex: false,
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function PostForm({
  initialPost,
  categories = [],
}: {
  initialPost?: InitialPost;
  categories?: ArticleCategoryOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initialPost?.id);
  const [form, setForm] = useState<InitialPost>(initialPost ?? EMPTY_POST);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof InitialPost>(key: K, value: InitialPost[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const seoResult = useMemo(
    () =>
      calculateSeoAeoGeo(
        postToScoreInput({
          titleTh: form.titleTh,
          titleEn: form.titleEn,
          seoTitle: form.seoTitle,
          seoTitleEn: form.seoTitleEn,
          seoDesc: form.seoDesc,
          seoDescEn: form.seoDescEn,
          excerptTh: form.excerptTh,
          bodyTh: form.bodyTh,
          slug: form.slug,
          hasCoverImage: Boolean(form.coverImageUrl),
        }),
      ),
    [
      form.titleTh,
      form.titleEn,
      form.seoTitle,
      form.seoTitleEn,
      form.seoDesc,
      form.seoDescEn,
      form.excerptTh,
      form.bodyTh,
      form.slug,
      form.coverImageUrl,
    ],
  );

  const canonicalPath = form.kind === "ARTICLE" ? "articles" : "news";

  const handleTitleChange = (value: string) => {
    update("titleTh", value);
    if (!slugTouched) {
      update("slug", slugify(value));
    }
  };

  const handleSave = async () => {
    setError(null);
    const input: PostFormInput = {
      kind: form.kind,
      status: form.status,
      slug: form.slug,
      titleTh: form.titleTh,
      titleEn: form.titleEn,
      excerptTh: form.excerptTh,
      excerptEn: form.excerptEn,
      bodyTh: form.bodyTh,
      bodyEn: form.bodyEn,
      categoryId: form.categoryId,
      featured: form.featured,
      coverImageUrl: form.coverImageUrl,
      seoTitle: form.seoTitle,
      seoDesc: form.seoDesc,
      seoTitleEn: form.seoTitleEn,
      seoDescEn: form.seoDescEn,
      seoNoIndex: form.seoNoIndex,
    };

    const result = isEdit ? await updatePost(initialPost!.id, input) : await createPost(input);
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }

    router.push("/admin/articles");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm("ยืนยันการลบบทความนี้?")) return;
    const result = await deletePost(initialPost!.id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/articles");
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
          <label className={labelClass}>ประเภท</label>
          <select
            className={inputClass}
            value={form.kind}
            onChange={(e) => update("kind", e.target.value as InitialPost["kind"])}
          >
            <option value="ARTICLE">บทความ</option>
            <option value="NEWS">ข่าวสาร</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>สถานะ</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => update("status", e.target.value as InitialPost["status"])}
          >
            <option value="DRAFT">ฉบับร่าง</option>
            <option value="PUBLISHED">เผยแพร่แล้ว</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>ชื่อเรื่อง (ไทย)</label>
          <input
            className={inputClass}
            value={form.titleTh}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>ชื่อเรื่อง (อังกฤษ)</label>
          <input
            className={inputClass}
            value={form.titleEn}
            onChange={(e) => update("titleEn", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>สลัก (URL slug)</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
          />
        </div>

        <div>
          <label className={labelClass}>หมวดหมู่</label>
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">— ไม่ระบุ —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTh}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            ข่าวเด่น (แสดงเป็นรายการหลัก)
          </label>
        </div>

        <div className="sm:col-span-2">
          <ImageUploader
            label="รูปภาพหน้าปก"
            value={form.coverImageUrl}
            onChange={(url) => update("coverImageUrl", url)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>สรุปย่อ (ไทย)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={form.excerptTh}
            onChange={(e) => update("excerptTh", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>สรุปย่อ (อังกฤษ)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={form.excerptEn}
            onChange={(e) => update("excerptEn", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>เนื้อหา (ไทย)</label>
          <textarea
            className={inputClass}
            rows={8}
            value={form.bodyTh}
            onChange={(e) => update("bodyTh", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>เนื้อหา (อังกฤษ)</label>
          <textarea
            className={inputClass}
            rows={8}
            value={form.bodyEn}
            onChange={(e) => update("bodyEn", e.target.value)}
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
            placeholder={form.titleTh || "ค่าเริ่มต้น: ใช้ชื่อเรื่อง"}
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
            placeholder={form.excerptTh || "ค่าเริ่มต้น: ใช้สรุปย่อ"}
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
            {`${SITE_URL}/${canonicalPath}/${form.slug || "…"}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SaveButton label={isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างบทความ"} onSave={handleSave} />
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            ลบบทความ
          </button>
        )}
      </div>
    </div>
  );
}
