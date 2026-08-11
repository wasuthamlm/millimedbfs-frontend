"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  EyeIcon,
  ExternalLinkIcon,
  GripIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import { SeoScoreBadge } from "@/components/admin/articles/SeoScoreBadge";
import type { PageSection } from "@/data/admin-pages";
import type { ArticleView, NewsView } from "@/lib/post-view";
import type { NavLink } from "@/data/nav";
import type { FooterColumnData, FooterContactData } from "@/components/layout/Footer";
import { SectionPreviewBody } from "./SectionPreviewBody";
import { SectionSettingsPanel } from "./SectionSettingsPanel";
import { SeoPanel } from "./SeoPanel";
import { AddBlockButton } from "./AddBlockButton";
import { PreviewModal } from "./PreviewModal";
import { saveSections } from "@/app/admin/pages/[slug]/actions";
import { setPageStatus } from "@/app/admin/pages/actions";
import { createNavLink } from "@/app/admin/menus/actions";

export function PageEditor({
  page,
  initialSections,
  seoScore,
  seoTitle,
  seoDesc,
  seoTitleEn,
  seoDescEn,
  seoNoIndex,
  navLinkCount,
  articleCount,
  newsCount,
  previewArticles,
  previewNews,
  navLinks,
  footerColumns,
  footerContact,
}: {
  page: { id: string; slug: string; titleTh: string; titleEn: string; status: "DRAFT" | "PUBLISHED" };
  initialSections: PageSection[];
  seoScore: number;
  seoTitle: string;
  seoDesc: string;
  seoTitleEn: string;
  seoDescEn: string;
  seoNoIndex: boolean;
  navLinkCount: number;
  articleCount: number;
  newsCount: number;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
  navLinks: NavLink[];
  footerColumns: FooterColumnData[];
  footerContact: FooterContactData | null;
}) {
  const [sections, setSections] = useState(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"block" | "seo">("block");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [status, setStatus] = useState(page.status);
  const [linkCount, setLinkCount] = useState(navLinkCount);
  const [addingMenu, setAddingMenu] = useState(false);

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

  const move = (index: number, direction: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  const patchSection = (id: string, patch: Partial<PageSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSection = (section: PageSection) => {
    setSections((prev) => [...prev, { ...section, order: prev.length + 1 }]);
    setSelectedId(section.id);
    setTab("block");
  };

  const doSave = () => saveSections(page.slug, page.titleTh, sections);

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

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">คลิกบล็อกใดก็ได้บนหน้าเว็บด้านล่าง เพื่อแก้ไขในแผงด้านขวา</p>
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
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <div key={section.id} className="relative pt-9">
                {selectedId === section.id && (
                  <div className="absolute left-0 top-0 z-10 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-navy px-2.5 py-1 text-xs font-medium text-white">
                      <GripIcon className="h-3.5 w-3.5" />
                      {section.titleTh || "บล็อกใหม่"}
                    </span>
                    <button
                      type="button"
                      aria-label="เลื่อนขึ้น"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(index, -1);
                      }}
                      className="rounded-md bg-white p-1.5 text-slate-500 shadow hover:text-slate-800 disabled:opacity-30"
                    >
                      <ArrowUpIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="เลื่อนลง"
                      disabled={index === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(index, 1);
                      }}
                      className="rounded-md bg-white p-1.5 text-slate-500 shadow hover:text-slate-800 disabled:opacity-30"
                    >
                      <ArrowDownIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="ลบบล็อก"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="rounded-md bg-white p-1.5 text-red-500 shadow hover:text-red-600"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div
                  onClick={() => {
                    setSelectedId(section.id);
                    setTab("block");
                  }}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-xl border bg-white transition-colors",
                    selectedId === section.id
                      ? "border-brand-navy ring-2 ring-brand-navy/20"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <SectionPreviewBody section={section} previewArticles={previewArticles} previewNews={previewNews} />
                </div>
              </div>
            ))}

            <AddBlockButton onAdd={addSection} />
          </div>
        </div>

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
              sections={sections}
              initialSeoTitle={seoTitle}
              initialSeoDesc={seoDesc}
              initialSeoTitleEn={seoTitleEn}
              initialSeoDescEn={seoDescEn}
              initialSeoNoIndex={seoNoIndex}
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
