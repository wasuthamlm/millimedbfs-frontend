"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Row selection + bulk actions for server-rendered admin tables (ported from
 * the legacy useRowSelection / SelectCheckbox / BulkActionBar). Wrap the table
 * in <SelectionProvider>, put <RowCheckbox id> in each row and
 * <SelectAllCheckbox ids> in the header, and render <BulkActionBar actions>.
 */

type SelectionCtx = { selected: Set<string>; toggle: (id: string) => void; setAll: (ids: string[], on: boolean) => void; clear: () => void };
const Ctx = createContext<SelectionCtx | null>(null);

function useSelection() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Selection components must be inside <SelectionProvider>");
  return ctx;
}

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const value: SelectionCtx = {
    selected,
    toggle: (id) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    setAll: (ids, on) =>
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
        return next;
      }),
    clear: () => setSelected(new Set()),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const boxClass = "h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy";

export function RowCheckbox({ id, label }: { id: string; label?: string }) {
  const { selected, toggle } = useSelection();
  return <input type="checkbox" aria-label={label ?? "เลือกแถว"} className={boxClass} checked={selected.has(id)} onChange={() => toggle(id)} />;
}

export function SelectAllCheckbox({ ids }: { ids: string[] }) {
  const { selected, setAll } = useSelection();
  const all = ids.length > 0 && ids.every((id) => selected.has(id));
  return <input type="checkbox" aria-label="เลือกทั้งหมด" className={boxClass} checked={all} onChange={() => setAll(ids, !all)} />;
}

export type BulkAction = {
  label: string;
  run: (ids: string[]) => Promise<{ error?: string } | void>;
  confirm?: string;
  tone?: "default" | "danger";
};

export function BulkActionBar({ actions }: { actions: BulkAction[] }) {
  const { selected, clear } = useSelection();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  if (selected.size === 0 || actions.length === 0) return null;

  const run = (action: BulkAction) => {
    const ids = [...selected];
    if (action.confirm && !window.confirm(action.confirm.replace("{n}", String(ids.length)))) return;
    startTransition(async () => {
      setError(null);
      const res = await action.run(ids);
      if (res && res.error) setError(res.error);
      else clear();
      router.refresh();
    });
  };

  return (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-brand-navy/20 bg-white px-4 py-3 text-sm shadow-md">
      <span className="font-medium text-slate-600">เลือกแล้ว {selected.size} รายการ</span>
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          disabled={pending}
          onClick={() => run(a)}
          className={cn(
            "rounded-lg border px-3 py-1.5 font-medium disabled:opacity-50",
            a.tone === "danger" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-700 hover:bg-slate-50",
          )}
        >
          {a.label}
        </button>
      ))}
      <button type="button" onClick={clear} className="ml-auto text-xs text-slate-400 hover:text-slate-600">
        ยกเลิกการเลือก
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
