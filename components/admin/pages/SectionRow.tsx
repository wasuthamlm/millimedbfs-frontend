"use client";

import {
  GripIcon,
  DatabaseIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@/components/ui/admin-icons";
import { cn } from "@/lib/utils";
import type { PageSection } from "@/data/admin-pages";
import type { ArticleView, NewsView } from "@/lib/post-view";
import { SectionSettingsPanel } from "./SectionSettingsPanel";
import { SectionPreviewBody } from "./SectionPreviewBody";

export function SectionRow({
  section,
  isFirst,
  isLast,
  isEditing,
  onToggleEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChange,
  onSave,
  articleCount,
  newsCount,
  previewArticles,
  previewNews,
}: {
  section: PageSection;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<PageSection>) => void;
  onSave: () => Promise<void>;
  articleCount: number;
  newsCount: number;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3">
        <GripIcon className="h-4 w-4 shrink-0 text-slate-300" />
        <span className="text-sm font-semibold text-brand-navy">
          {section.order}. {section.titleTh}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
          <DatabaseIcon className="h-3 w-3" />
          {section.sourceLabel}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="เลื่อนขึ้น"
            disabled={isFirst}
            onClick={onMoveUp}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="เลื่อนลง"
            disabled={isLast}
            onClick={onMoveDown}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleEdit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium",
              isEditing ? "bg-slate-100 text-slate-600" : "text-brand-navy hover:bg-brand-navy/5"
            )}
          >
            <PencilIcon className="h-4 w-4" />
            {isEditing ? "ปิดการแก้ไข" : "แก้ไขตรงนี้"}
          </button>
          <button
            type="button"
            aria-label="ลบ section"
            onClick={onDelete}
            className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <SectionPreviewBody section={section} previewArticles={previewArticles} previewNews={previewNews} />
      </div>

      {isEditing && (
        <SectionSettingsPanel
          section={section}
          onChange={onChange}
          onSave={onSave}
          articleCount={articleCount}
          newsCount={newsCount}
        />
      )}
    </div>
  );
}
