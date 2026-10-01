"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SaveButton } from "@/components/admin/SaveButton";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FaqEditor, type FaqItem } from "@/components/admin/FaqEditor";
import { ContentAuditPanel } from "@/components/admin/seo/ContentAuditPanel";
import { EMPTY_SEO, SeoFields, type SeoValue } from "@/components/admin/seo/SeoFields";
import { AiArticleWriter } from "@/components/admin/articles/AiArticleWriter";
import { RelatedPicker, type RelatedOption } from "@/components/admin/RelatedPicker";
import { SparklesIcon, TrashIcon } from "@/components/ui/admin-icons";
import { slugify } from "@/lib/slugify";
import { cn, fromBangkokInput } from "@/lib/utils";
import { postPath } from "@/lib/public-urls";
import { createPost, trashPosts, updatePost, type PostFormInput } from "@/app/admin/articles/actions";
import { aiTranslateFields } from "@/app/admin/ai/actions";

export type InitialPost = SeoValue & {
  id: string;
  kind: "ARTICLE" | "NEWS";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
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
  /** yyyy-MM-ddTHH:mm in Bangkok time (datetime-local) or "" */
  publishedAt: string;
  faq: FaqItem[];
  schemaArticle: Record<string, unknown> | null;
  relatedPostIds: string[];
  relatedProductIds: string[];
};

export type ArticleCategoryOption = { id: string; nameTh: string; slug: string };

const EMPTY_POST: InitialPost = {
  ...EMPTY_SEO,
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
  publishedAt: "",
  faq: [],
  schemaArticle: null,
  relatedPostIds: [],
  relatedProductIds: [],
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const cardClass = "grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2";

type Tab = "content" | "seo" | "faq";

export function PostForm({
  initialPost,
  categories = [],
  canPublish,
  canDelete,
  postOptions = [],
  productOptions = [],
}: {
  initialPost?: InitialPost;
  categories?: ArticleCategoryOption[];
  postOptions?: RelatedOption[];
  productOptions?: RelatedOption[];
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialPost?.id);
  const [form, setForm] = useState<InitialPost>(initialPost ?? EMPTY_POST);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [translating, startTranslate] = useTransition();

  const update = <K extends keyof InitialPost>(key: K, value: InitialPost[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const categorySlug = categories.find((c) => c.id === form.categoryId)?.slug;
  const path = postPath({ slug: form.slug || "…", kind: form.kind, articleCategory: categorySlug ? { slug: categorySlug } : null });

  const handleTitleChange = (value: string) => {
    update("titleTh", value);
    if (!slugTouched) update("slug", slugify(value));
  };

  const translateToEnglish = () =>
    startTranslate(async () => {
      setError(null);
      const res = await aiTranslateFields({
        fields: { title: form.titleTh, excerpt: form.excerptTh, body: form.bodyTh },
        locales: ["en"],
      });
      if (res.error || !res.data) {
        setError(res.error ?? "แปลไม่สำเร็จ");
        return;
      }
      const en = res.data.en;
      setForm((f) => ({ ...f, titleEn: en.title ?? f.titleEn, excerptEn: en.excerpt ?? f.excerptEn, bodyEn: en.body ?? f.bodyEn }));
    });

  const handleSave = async () => {
    setError(null);
    const { id: _id, ...rest } = form;
    void _id;
    const input: PostFormInput = {
      ...rest,
      status: canPublish ? form.status : "DRAFT",
      publishedAt: fromBangkokInput(form.publishedAt),
    };
    const result = isEdit ? await updatePost(initialPost!.id, input) : await createPost(input);
    if ("error" in result && result.error) {
      setError(result.error);
      throw new Error(result.error);
    }
    if (!("id" in result)) return;
    if (isEdit) {
      // The server may have adjusted the slug to keep it unique.
      update("slug", result.slug);
      router.refresh();
    } else {
      router.push(`/admin/articles/${result.id}/edit`);
    }
  };

  const handleTrash = async () => {
    if (!isEdit || !window.confirm("ย้ายบทความนี้ไปถังขยะ? (กู้คืนได้จากถังขยะ)")) return;
    const result = await trashPosts([initialPost!.id]);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/articles");
    router.refresh();
  };

  const tabButton = (key: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium",
        tab === key ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      <AiArticleWriter
        onGenerated={(a) => {
          setForm((f) => ({
            ...f,
            titleTh: a.titleTh,
            bodyTh: a.bodyTh,
            excerptTh: a.excerptTh,
            seoTitle: a.seoTitle,
            seoDesc: a.seoDesc,
            focusKeyword: a.focusKeyword,
            secondaryKeywords: a.secondaryKeywords,
            faq: a.faq.map((q) => ({ qTh: q.qTh, aTh: q.aTh, qEn: "", aEn: "" })),
            schemaArticle: a.schemaArticle,
            slug: slugTouched ? f.slug : slugify(a.slug) || f.slug,
          }));
          setTab("content");
        }}
      />

      <ContentAuditPanel
        title={form.titleTh}
        metaTitle={form.seoTitle}
        metaDesc={form.seoDesc}
        focusKeyword={form.focusKeyword}
        bodyHtml={form.bodyTh}
        images={[form.coverImageUrl]}
        faq={form.faq}
      />

      <div className="flex gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
        {tabButton("content", "เนื้อหา")}
        {tabButton("seo", "SEO / โซเชียล")}
        {tabButton("faq", `FAQ (${form.faq.length})`)}
      </div>

      {tab === "content" && (
        <>
          <div className={cardClass}>
            <div>
              <label className={labelClass}>ประเภท</label>
              <select className={inputClass} value={form.kind} onChange={(e) => update("kind", e.target.value as InitialPost["kind"])}>
                <option value="ARTICLE">บทความ</option>
                <option value="NEWS">ข่าวสาร</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>หมวดหมู่ (ประเภทบทความ)</label>
              <select className={inputClass} value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
                <option value="">— ไม่ระบุ —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameTh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>สถานะ</label>
              <select
                className={inputClass}
                value={canPublish ? form.status : "DRAFT"}
                disabled={!canPublish}
                onChange={(e) => update("status", e.target.value as InitialPost["status"])}
              >
                <option value="DRAFT">ฉบับร่าง</option>
                <option value="PUBLISHED">เผยแพร่แล้ว</option>
                <option value="ARCHIVED">เก็บถาวร</option>
              </select>
              {!canPublish && <p className="mt-1 text-xs text-amber-600">Contributor บันทึกได้เฉพาะฉบับร่าง รอผู้อนุมัติเผยแพร่</p>}
            </div>
            <div>
              <label className={labelClass}>วันที่เผยแพร่</label>
              <input type="datetime-local" className={inputClass} value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} />
              <p className="mt-1 text-xs text-slate-400">เว้นว่างเพื่อใช้เวลาที่กดเผยแพร่</p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>ชื่อเรื่อง (ไทย)</label>
              <input className={inputClass} value={form.titleTh} onChange={(e) => handleTitleChange(e.target.value)} />
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
              <p className="mt-1 truncate text-xs text-slate-400">{path} — ถ้าซ้ำกับบทความอื่น ระบบจะเติมตัวเลขต่อท้ายให้</p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
              บทความเด่น (แสดงเป็นรายการหลัก)
            </label>

            <div className="sm:col-span-2">
              <ImageUploader label="รูปภาพหน้าปก" value={form.coverImageUrl} onChange={(url) => update("coverImageUrl", url)} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>สรุปย่อ (ไทย)</label>
              <textarea className={inputClass} rows={2} value={form.excerptTh} onChange={(e) => update("excerptTh", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>เนื้อหา (ไทย)</label>
              <RichTextEditor value={form.bodyTh} onChange={(html) => update("bodyTh", html)} />
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between sm:col-span-2">
              <h3 className="text-sm font-semibold text-slate-800">ภาษาอังกฤษ</h3>
              <button
                type="button"
                onClick={translateToEnglish}
                disabled={translating || !form.titleTh}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                <SparklesIcon className="h-3.5 w-3.5" />
                {translating ? "กำลังแปล..." : "แปลจากภาษาไทยด้วย AI"}
              </button>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>ชื่อเรื่อง (อังกฤษ)</label>
              <input className={inputClass} value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>สรุปย่อ (อังกฤษ)</label>
              <textarea className={inputClass} rows={2} value={form.excerptEn} onChange={(e) => update("excerptEn", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>เนื้อหา (อังกฤษ)</label>
              <RichTextEditor value={form.bodyEn} onChange={(html) => update("bodyEn", html)} />
            </div>
            <p className="text-xs text-slate-400 sm:col-span-2">ภาษาอื่น (จีน เกาหลี ญี่ปุ่น ฯลฯ) จัดการได้ที่เมนู “แปลภาษา”</p>
          </div>

          <div className={cardClass}>
            <h3 className="text-sm font-semibold text-slate-800 sm:col-span-2">เนื้อหาที่เกี่ยวข้อง</h3>
            <p className="-mt-2 text-xs text-slate-400 sm:col-span-2">แสดงท้ายบทความ — ถ้าไม่เลือก ระบบจะแสดงบทความล่าสุดในประเภทเดียวกัน 3 รายการ</p>
            <RelatedPicker
              label="บทความที่เกี่ยวข้อง"
              options={postOptions.filter((o) => o.id !== form.id)}
              value={form.relatedPostIds}
              onChange={(ids) => update("relatedPostIds", ids)}
            />
            <RelatedPicker label="สินค้าที่เกี่ยวข้อง" options={productOptions} value={form.relatedProductIds} onChange={(ids) => update("relatedProductIds", ids)} />
          </div>
        </>
      )}

      {tab === "seo" && (
        <SeoFields
          value={form}
          onChange={(seo) => setForm((f) => ({ ...f, ...seo }))}
          context={{ title: form.titleTh, body: form.bodyTh }}
          path={path}
          coverImageUrl={form.coverImageUrl}
        />
      )}

      {tab === "faq" && <FaqEditor value={form.faq} onChange={(faq) => update("faq", faq)} context={{ title: form.titleTh, body: form.bodyTh }} />}

      <div className="flex items-center justify-between">
        <SaveButton label={isEdit ? "บันทึกการเปลี่ยนแปลง" : "สร้างบทความ"} onSave={handleSave} />
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
