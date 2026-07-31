import { ChevronDown } from "@/components/ui/icons";

export function LanguageSwitcher() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-navy/30 hover:text-brand-navy"
    >
      <span aria-hidden="true">🇹🇭</span>
      <span>ไทย</span>
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}
