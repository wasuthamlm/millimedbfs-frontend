"use client";

import { useState } from "react";
import { EyeIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import type { AdminPage, PageSection } from "@/data/admin-pages";
import { SectionRow } from "./SectionRow";
import { PreviewModal } from "./PreviewModal";

export function PageEditor({
  page,
  initialSections,
}: {
  page: AdminPage;
  initialSections: PageSection[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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
  };

  const patchSection = (id: string, patch: Partial<PageSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-20 -mx-6 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-3 backdrop-blur sm:-mx-10 sm:px-10">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            ภาพรวมหน้า — {page.titleTh} · ใช้ปุ่มขึ้น/ลงเพื่อจัดลำดับ Section
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <EyeIcon className="h-4 w-4" />
            ดูตัวอย่าง
          </button>
          <SaveButton label="บันทึกลำดับ" />
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm text-slate-400">
          ยังไม่มี section สำหรับหน้านี้ — ฟีเจอร์เพิ่ม section กำลังอยู่ระหว่างการพัฒนา
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map((section, index) => (
            <SectionRow
              key={section.id}
              section={section}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              isEditing={editingId === section.id}
              onToggleEdit={() => setEditingId((prev) => (prev === section.id ? null : section.id))}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onDelete={() => removeSection(section.id)}
              onChange={(patch) => patchSection(section.id, patch)}
            />
          ))}
        </div>
      )}

      {previewOpen && <PreviewModal sections={sections} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
