"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "@/components/ui/icons";
import { CheckIcon, FolderIcon } from "@/components/ui/admin-icons";

export type FolderSelectOption = { value: string; label: string };

export function FolderSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  options: FolderSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border bg-white py-1.5 pl-3 pr-2 text-left text-sm text-slate-700 outline-none transition-colors",
          open ? "border-brand-navy ring-1 ring-brand-navy" : "border-slate-200 hover:border-slate-300",
        )}
      >
        <FolderIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="flex-1 truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-auto rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg shadow-slate-900/10">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  isActive ? "font-medium text-brand-navy" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {isActive && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
