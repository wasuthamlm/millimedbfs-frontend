"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EyeIcon, ExternalLinkIcon, PlusIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import { SeoScoreBadge } from "@/components/admin/articles/SeoScoreBadge";
import type { PageSection } from "@/lib/sections";
import type { RelatedOption } from "@/components/admin/RelatedPicker";
import type { ArticleView, NewsView } from "@/lib/post-view";
import type { NavLink } from "@/data/nav";
import type { FooterColumnData, FooterContactData } from "@/components/layout/Footer";
import { SectionSettingsPanel } from "./SectionSettingsPanel";
import { SeoPanel } from "./SeoPanel";
import { SectionsCanvas } from "./SectionsCanvas";
import { PreviewModal } from "./PreviewModal";
import { saveSections } from "@/app/admin/pages/[slug]/actions";
import { setPageStatus, type PageSeoInput } from "@/app/admin/pages/actions";
import { createNavLink } from "@/app/admin/menus/actions";

export function PageEditor({
  page,
  initialSections,
  seoScore,
  seoInitial,
  navLinkCount,
  articleCount,
  newsCount,
  previewArticles,
  previewNews,
  navLinks,
  footerColumns,
  footerContact,
  productCategories,
  articleTypes,
  productOptions,
  canPublish,
}: {
  page: { id: string; slug: string; titleTh: string; titleEn: string; status: "DRAFT" | "PUBLISHED" };
  initialSections: PageSection[];
  seoScore: number;
  seoInitial: PageSeoInput;
  navLinkCount: number;
  articleCount: number;
  newsCount: number;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
  navLinks: NavLink[];
  footerColumns: FooterColumnData[];
  footerContact: FooterContactData | null;
  productCategories: { id: string; nameTh: string; parentId: string | null }[];
  articleTypes: { id: string; nameTh: string }[];
  productOptions: RelatedOption[];
  canPublish: boolean;
}) {
  const [sections, setSections] = useState(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"block" | "seo">("block");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [status, setStatus] = useState(page.status);
  const [linkCount, setLinkCount] = useState(navLinkCount);
  const [addingMenu, setAddingMenu] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selected = sections.find((s) => s.id === selectedId) ?? null;

  const handleAddMenu = async () => {
    setAddingMenu(true);
    try {
      await createNavLink({
        labelTh: page.titleTh,
        labelEn: "",
        href: page.slug === "home" ? "/" : `/${page.slug}`,
        parentId: null,
      });
      setLinkCount((prev) => prev + 1);
    } finally {
      setAddingMenu(false);
    }
  };

  const patchSection = (id: string, patch: Partial<PageSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const doSave = async () => {
    setSaveError(null);
    const res = await saveSections(page.slug, page.titleTh, sections);
    if (res.error) {
      setSaveError(res.error);
      throw new Error(res.error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/pages" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
          ← Pages
        </Link>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
          {page.titleTh}
        </span>
        <span className="text-slate-300">/</span>
        <code className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500">
          {page.slug}
        </code>
        {canPublish ? (
        <StatusSelectPill
          value={status}
          ariaLabel={`สถานะของ ${page.titleTh}`}
          colorClass={status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}
          options={[
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
          ]}
          onChange={(value) => {
            setStatus(value);
            void setPageStatus(page.id, value);
          }}
        />
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">{status}</span>
        )}
        {linkCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
            มีเมนูลิงก์มาหน้านี้ {linkCount} รายการ
          </span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              ยังไม่มีเมนูลิงก์มาหน้านี้ ({page.slug === "home" ? "/" : `/${page.slug}`})
            </span>
            <button
              type="button"
              disabled={addingMenu}
              onClick={() => void handleAddMenu()}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-navy px-3 py-1.5 text-xs font-medium text-brand-navy hover:bg-brand-navy/5 disabled:opacity-50"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              {addingMenu ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={page.slug === "home" ? "/" : `/${page.slug}`}
            target="_blank"
            aria-label="เปิดดูหน้าเว็บจริง"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500">
            คะแนน SEO/AEO/GEO
            <SeoScoreBadge score={seoScore} />
          </div>
          <SaveButton label="บันทึกการเปลี่ยนแปลง" onSave={doSave} />
        </div>
      </div>

      {saveError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{saveError}</div>}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">คลิกบล็อกเพื่อแก้ไขในแผงด้านขวา — ลากบล็อกเพื่อเรียงลำดับ</p>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <EyeIcon className="h-4 w-4" />
          ดูตัวอย่าง
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <SectionsCanvas
          sections={sections}
          onChange={setSections}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setTab("block");
          }}
          previewArticles={previewArticles}
          previewNews={previewNews}
        />

        <div className="h-fit rounded-2xl border border-slate-100 bg-white shadow-sm lg:sticky lg:top-4">
          <div className="flex border-b border-slate-100">
            <button
              type="button"
              onClick={() => setTab("block")}
              className={cn(
                "flex-1 border-b-2 px-4 py-3 text-sm font-medium",
                tab === "block" ? "border-brand-navy text-brand-navy" : "border-transparent text-slate-400",
              )}
            >
              บล็อกที่เลือก
            </button>
            <button
              type="button"
              onClick={() => setTab("seo")}
              className={cn(
                "flex-1 border-b-2 px-4 py-3 text-sm font-medium",
                tab === "seo" ? "border-brand-navy text-brand-navy" : "border-transparent text-slate-400",
              )}
            >
              SEO · AEO · GEO
            </button>
          </div>

          {tab === "block" ? (
            selected ? (
              <SectionSettingsPanel
                section={selected}
                onChange={(patch) => patchSection(selected.id, patch)}
                onSave={doSave}
                articleCount={articleCount}
                newsCount={newsCount}
                productCategories={productCategories}
                articleTypes={articleTypes}
                productOptions={productOptions}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-sm text-slate-400">
                <p>คลิกบล็อกใดก็ได้บนหน้าเว็บ</p>
                <p>เพื่อแก้ไขตรงนี้</p>
              </div>
            )
          ) : (
            <SeoPanel
              pageId={page.id}
              slug={page.slug}
              titleTh={page.titleTh}
              titleEn={page.titleEn}
              sections={sections.map((sec) => ({ titleTh: sec.titleTh, bodyTh: sec.config.bodyTh, imageUrl: sec.config.imageUrl }))}
              initial={seoInitial}
            />
          )}
        </div>
      </div>

      {previewOpen && (
        <PreviewModal
          sections={sections}
          onClose={() => setPreviewOpen(false)}
          previewArticles={previewArticles}
          previewNews={previewNews}
          navLinks={navLinks}
          footerColumns={footerColumns}
          footerContact={footerContact}
        />
      )}
    </div>
  );
}
