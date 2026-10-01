"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/ui/admin-icons";
import { BLOCK_TYPES, newSection, type PageSection, type SectionType } from "@/lib/sections";

// Legacy-only types aren't offered for new blocks.
const HIDDEN: SectionType[] = ["cta-bar", "company-intro"];

export function AddBlockButton({ onAdd }: { onAdd: (section: PageSection) => void }) {
  const [open, setOpen] = useState(false);
  const types = (Object.keys(BLOCK_TYPES) as SectionType[]).filter((t) => !HIDDEN.includes(t));

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-navy/40 py-4 text-sm font-medium text-brand-navy hover:bg-brand-navy/5"
      >
        <PlusIcon className="h-4 w-4" />
        เพิ่มบล็อกใหม่
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-3">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(newSection(type));
                setOpen(false);
              }}
              className="flex flex-col items-start gap-0.5 rounded-lg border border-slate-100 p-3 text-left hover:border-brand-navy hover:bg-brand-navy/5"
            >
              <span className="text-sm font-semibold text-slate-800">{BLOCK_TYPES[type].label}</span>
              <span className="text-xs text-slate-400">{BLOCK_TYPES[type].description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
