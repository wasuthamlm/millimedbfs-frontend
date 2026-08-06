"use client";

import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function StatusSelectPill<T extends string>({
  value,
  options,
  colorClass,
  disabled,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  colorClass: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "cursor-pointer appearance-none rounded-full border-0 py-0.5 pl-2.5 pr-6 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60",
          colorClass
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70" />
    </div>
  );
}
