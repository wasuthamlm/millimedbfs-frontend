"use client";

import { useId } from "react";
import type { LinkOption } from "@/lib/link-options";

/** Free-text link field with suggestions from real pages and categories. */
export function LinkSuggestInput({
  value,
  onChange,
  options,
  className,
  placeholder = "พิมพ์ชื่อหน้า เช่น /about หรือเลือกจากรายการ",
}: {
  value: string;
  onChange: (value: string) => void;
  options: LinkOption[];
  className?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <>
      <input list={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
      <datalist id={id}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </datalist>
    </>
  );
}
