"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GripIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, CopyIcon } from "@/components/ui/admin-icons";
import { BLOCK_TYPES, type PageSection } from "@/lib/sections";
import type { ArticleView, NewsView } from "@/lib/post-view";
import { SectionPreviewBody } from "./SectionPreviewBody";
import { AddBlockButton } from "./AddBlockButton";

/** Block list with select / drag / move / duplicate / delete — shared by the page and landing editors. */
export function SectionsCanvas({
  sections,
  onChange,
  selectedId,
  onSelect,
  previewArticles,
  previewNews,
}: {
  sections: PageSection[];
  onChange: (next: PageSection[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  previewArticles: ArticleView[];
  previewNews: NewsView[];
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const update = (fn: (prev: PageSection[]) => PageSection[]) => onChange(fn(sections));

  const move = (index: number, direction: -1 | 1) => {
    update((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const moveTo = (from: number, to: number) => {
    if (from === to) return;
    update((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const duplicateSection = (index: number) => {
    const source = structuredClone(sections[index]);
    // Anchor IDs must stay unique on the page, so the copy starts without one.
    const copy: PageSection = { ...source, id: crypto.randomUUID(), config: { ...source.config, anchorId: undefined } };
    update((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    onSelect(copy.id);
  };

  const removeSection = (id: string) => {
    if (!window.confirm("ลบบล็อกนี้? (มีผลเมื่อกดบันทึก)")) return;
    update((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));
    if (selectedId === id) onSelect(null);
  };

  const addSection = (section: PageSection) => {
    update((prev) => [...prev, { ...section, order: prev.length + 1 }]);
    onSelect(section.id);
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex flex-col gap-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={cn("relative pt-9", dragIndex === index && "opacity-40")}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) moveTo(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            {selectedId === section.id && (
              <div className="absolute left-0 top-0 z-10 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-navy px-2.5 py-1 text-xs font-medium text-white">
                  <GripIcon className="h-3.5 w-3.5" />
                  {section.customLabel || section.titleTh || BLOCK_TYPES[section.type]?.label || "บล็อกใหม่"}
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
                  aria-label="ทำสำเนาบล็อก"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateSection(index);
                  }}
                  className="rounded-md bg-white p-1.5 text-slate-500 shadow hover:text-slate-800"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
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
              onClick={() => onSelect(section.id)}
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
  );
}
