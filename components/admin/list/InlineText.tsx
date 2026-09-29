"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/** Click-to-edit text cell (legacy InlineText). Enter/blur saves, Escape cancels. */
export function InlineText({
  value,
  placeholder,
  onSave,
  className,
  disabled,
}: {
  value: string;
  placeholder?: string;
  onSave: (value: string) => Promise<{ error?: string }>;
  className?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const commit = () => {
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await onSave(draft);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setEditing(false);
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title={disabled ? undefined : "คลิกเพื่อแก้ไข"}
        className={cn("block max-w-full truncate text-left hover:text-brand-navy disabled:cursor-default", !value && "text-slate-300", className)}
      >
        {value || placeholder}
      </button>
    );
  }

  return (
    <span className="block">
      <input
        autoFocus
        value={draft}
        disabled={pending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-full rounded border border-brand-navy px-2 py-1 text-sm outline-none"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
