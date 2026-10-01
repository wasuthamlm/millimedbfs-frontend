"use client";

import { useMemo, useState } from "react";
import { XCircleIcon } from "@/components/ui/admin-icons";

export type RelatedOption = { id: string; label: string };

/** Searchable multi-select of related items (max `limit`), shown as removable chips. */
export function RelatedPicker({
  label,
  options,
  value,
  onChange,
  limit = 6,
}: {
  label: string;
  options: RelatedOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  limit?: number;
}) {
  const [q, setQ] = useState("");
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const matches = q.trim()
    ? options.filter((o) => !value.includes(o.id) && o.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">
        {label} <span className="font-normal text-slate-400">({value.length}/{limit})</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {value.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 rounded-full bg-brand-navy/10 px-3 py-1 text-xs text-brand-navy">
            {byId.get(id)?.label ?? "(ถูกลบแล้ว)"}
            <button type="button" aria-label="นำออก" onClick={() => onChange(value.filter((v) => v !== id))}>
              <XCircleIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      {value.length < limit && (
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="พิมพ์เพื่อค้นหา..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          {matches.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {matches.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...value, o.id]);
                      setQ("");
                    }}
                    className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
