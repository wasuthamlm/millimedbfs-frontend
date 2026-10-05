"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, RotateCcwIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import type { RelatedOption } from "@/components/admin/RelatedPicker";
import { SectionsCanvas } from "@/components/admin/pages/SectionsCanvas";
import { SectionSettingsPanel } from "@/components/admin/pages/SectionSettingsPanel";
import type { PageSection } from "@/lib/sections";
import type { ArticleView, NewsView } from "@/lib/post-view";
import {
  LANDING_PREVIEW_MESSAGE,
  LANDING_PREVIEW_READY,
  type LandingFaqItem,
  type LandingFooterConfig,
  type LandingHeaderConfig,
  type LandingPreviewConfig,
  type LandingTheme,
  type LandingWidgetConfig,
} from "@/lib/landing";
import { saveLandingPage } from "@/app/admin/landing/actions";
import { FooterPanel, HeaderPanel, SeoPanel, ThemePanel, WidgetPanel, type LandingSeoFields } from "./LandingPanels";

export type LandingEditorData = LandingSeoFields & {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  theme: LandingTheme;
  header: LandingHeaderConfig;
  footer: LandingFooterConfig;
  widget: LandingWidgetConfig;
  faq: LandingFaqItem[];
};

const TABS = [
  { key: "sections", label: "เนื้อหา" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "widget", label: "Widget" },
  { key: "theme", label: "ธีมสี" },
  { key: "seo", label: "SEO / AEO / GEO" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const DEVICES = [
  { key: "desktop", label: "Desktop", width: "100%" },
  { key: "tablet", label: "Tablet", width: "820px" },
  { key: "mobile", label: "Mobile", width: "390px" },
] as const;

/**
 * Real responsive preview — the actual /lp page in an iframe, so media queries match the
 * simulated device. Unsaved header/footer/widget/theme/FAQ changes are pushed in live;
 * block changes show after saving (the iframe reloads).
 */
function LandingPreview({ slug, config, reloadKey }: { slug: string; config: LandingPreviewConfig; reloadKey: number }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("desktop");
  const [nonce, setNonce] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const src = `/lp/${encodeURIComponent(slug)}?preview=1`;
  const width = DEVICES.find((d) => d.key === device)?.width ?? "100%";

  const push = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: LANDING_PREVIEW_MESSAGE, config }, window.location.origin);
  }, [config]);

  useEffect(() => {
    push();
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === LANDING_PREVIEW_READY) push();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [push]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-100 bg-slate-50">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-4 py-2.5">
        <span className="text-xs font-semibold text-brand-navy">ตัวอย่างสด</span>
        <div className="ml-1 flex items-center gap-1">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDevice(d.key)}
              className={cn("rounded-lg px-2.5 py-1.5 text-xs font-medium", device === d.key ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-slate-50")}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => setNonce((n) => n + 1)} title="รีเฟรช" aria-label="รีเฟรชตัวอย่าง" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-navy">
            <RotateCcwIcon className="h-3.5 w-3.5" />
          </button>
          <a href={src} target="_blank" rel="noreferrer" title="เปิดแท็บใหม่" aria-label="เปิดตัวอย่างในแท็บใหม่" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-navy">
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-auto p-4">
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ maxWidth: width }}>
          <iframe key={`${device}-${nonce}-${reloadKey}`} ref={frameRef} src={src} title="Landing preview" onLoad={push} className="h-[70vh] min-h-[520px] w-full border-0" />
        </div>
      </div>
      <p className="px-4 pb-3 text-center text-xs text-slate-400">Header/Footer/Widget/ธีม/FAQ อัปเดตทันที · บล็อกเนื้อหาอัปเดตหลังกดบันทึก</p>
    </div>
  );
}

export function LandingEditor({
  initial,
  initialSections,
  canPublish,
  articleCount,
  newsCount,
  previewArticles,
  previewNews,
  productCategories,
  articleTypes,
  productOptions,
}: {
  initial: LandingEditorData;
  initialSections: PageSection[];
  canPublish: boolean;
  articleCount: number;
  newsCount: number;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
  productCategories: { id: string; nameTh: string; parentId: string | null }[];
  articleTypes: { id: string; nameTh: string }[];
  productOptions: RelatedOption[];
}) {
  const [form, setForm] = useState(initial);
  const [savedSlug, setSavedSlug] = useState(initial.slug);
  const [sections, setSections] = useState(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("sections");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const patch = (p: Partial<LandingEditorData>) => setForm((f) => ({ ...f, ...p }));

  const previewConfig: LandingPreviewConfig = { header: form.header, footer: form.footer, widget: form.widget, theme: form.theme, faq: form.faq };

  const save = async () => {
    setError(null);
    const { id, header, footer, widget, faq, theme, ...rest } = form;
    const res = await saveLandingPage(id, { ...rest, ...theme, header, footer, widget, faq }, sections);
    if (res.error) {
      setError(res.error);
      throw new Error(res.error);
    }
    if (res.status) patch({ status: res.status });
    setSavedSlug(form.slug);
    setReloadKey((k) => k + 1);
  };

  const body = sections.map((s) => [s.titleTh, s.config.bodyTh ?? ""].join("\n")).join("\n").replace(/<[^>]*>/g, " ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/landing" className="text-sm font-medium text-slate-500 hover:text-brand-navy">
          ← Landing Pages
        </Link>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">{form.titleTh}</span>
        <code className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500">/lp/{savedSlug}</code>
        <StatusSelectPill
          value={form.status}
          disabled={!canPublish}
          ariaLabel="สถานะของหน้า"
          colorClass={form.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}
          options={[
            { value: "PUBLISHED", label: "Published" },
            { value: "DRAFT", label: "Draft" },
          ]}
          onChange={(status) => patch({ status })}
        />
        {!canPublish && <span className="text-xs text-slate-400">บันทึกได้เฉพาะฉบับร่าง — รอผู้อนุมัติเผยแพร่</span>}
        <div className="ml-auto flex items-center gap-2">
          <a
            href={`/lp/${savedSlug}${form.status === "PUBLISHED" ? "" : "?preview=1"}`}
            target="_blank"
            rel="noreferrer"
            aria-label="เปิดดูหน้าเว็บจริง"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
          <SaveButton label="บันทึก" onSave={save} />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              tab === t.key ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-navy hover:bg-brand-navy/10",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
          {tab === "sections" && (
            <div className="flex flex-col gap-3 p-4">
              <p className="text-sm text-slate-500">คลิกบล็อกเพื่อแก้ไข — ลากเพื่อเรียงลำดับ · ตั้ง Anchor ID ในแผงบล็อกเพื่อให้เมนู Header เลื่อนมาที่บล็อกได้</p>
              <SectionsCanvas
                sections={sections}
                onChange={setSections}
                selectedId={selectedId}
                onSelect={setSelectedId}
                previewArticles={previewArticles}
                previewNews={previewNews}
              />
            </div>
          )}
          {tab === "header" && <HeaderPanel cfg={form.header} onChange={(header) => patch({ header })} />}
          {tab === "footer" && <FooterPanel cfg={form.footer} onChange={(footer) => patch({ footer })} />}
          {tab === "widget" && <WidgetPanel cfg={form.widget} onChange={(widget) => patch({ widget })} />}
          {tab === "theme" && <ThemePanel theme={form.theme} onChange={(theme) => patch({ theme })} />}
          {tab === "seo" && (
            <SeoPanel form={form} onChange={patch} faq={form.faq} onFaqChange={(faq) => patch({ faq })} faqContext={{ title: form.titleTh, body }} />
          )}
        </div>

        <div className="min-w-0 xl:sticky xl:top-4 xl:h-fit">
          {tab === "sections" && selected ? (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-brand-navy">บล็อกที่เลือก</p>
                <button type="button" onClick={() => setSelectedId(null)} className="text-xs text-slate-400 hover:text-slate-700">
                  ปิด · ดูตัวอย่าง
                </button>
              </div>
              <SectionSettingsPanel
                section={selected}
                onChange={(p) => setSections((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...p } : s)))}
                sections={sections}
                onPatchSection={(id, p) => setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)))}
                onSave={save}
                articleCount={articleCount}
                newsCount={newsCount}
                productCategories={productCategories}
                articleTypes={articleTypes}
                productOptions={productOptions}
              />
            </div>
          ) : (
            <LandingPreview slug={savedSlug} config={previewConfig} reloadKey={reloadKey} />
          )}
        </div>
      </div>
    </div>
  );
}
