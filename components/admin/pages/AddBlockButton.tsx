"use client";

import { PlusIcon } from "@/components/ui/admin-icons";
import type { PageSection } from "@/data/admin-pages";

export function AddBlockButton({ onAdd, className }: { onAdd: (section: PageSection) => void; className?: string }) {
  const handleClick = () => {
    onAdd({
      id: crypto.randomUUID(),
      order: 0,
      type: "company-intro",
      titleTh: "",
      titleEn: "",
      sourceLabel: "เขียนเนื้อหาเอง",
      anchorId: "",
      bodyTh: "",
      visibility: { desktop: true, tablet: true, mobile: true },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-navy/40 py-4 text-sm font-medium text-brand-navy hover:bg-brand-navy/5"
      }
    >
      <PlusIcon className="h-4 w-4" />
      เพิ่มบล็อกใหม่
    </button>
  );
}
