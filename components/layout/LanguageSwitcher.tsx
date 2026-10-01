"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "@/components/ui/icons";
import { localeInfo, localePath, splitLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/i18n/ui";

export type SwitcherLanguage = { code: string; label: string };

// Remembered for next visit (legacy locale_pref cookie); read by proxy.ts later.
function rememberLocale(code: string) {
  document.cookie = `locale_pref=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/** Flag dropdown that switches to the same page in another enabled language (legacy LanguageSwitcher). */
export function LanguageSwitcher({ languages, color, compact }: { languages: SwitcherLanguage[]; color?: string; compact?: boolean }) {
  const pathname = usePathname() || "/";
  const { locale, path } = splitLocale(pathname);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (languages.length < 2) return null;
  const current = localeInfo(locale);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ui(locale, "chooseLanguage")}
        onClick={() => setOpen((o) => !o)}
        style={color ? { color } : undefined}
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium hover:bg-black/5"
      >
        <span aria-hidden="true">{current.flag}</span>
        {!compact && <span className="uppercase">{current.code}</span>}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
          {languages.map((l) => (
            <li key={l.code}>
              {/* Full navigation: the root layout (and <html lang>) changes with the locale. */}
              <a
                href={localePath(l.code, path)}
                onClick={() => rememberLocale(l.code)}
                role="option"
                aria-selected={l.code === locale}
                hrefLang={localeInfo(l.code).hreflang}
                className={cn("flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50", l.code === locale && "font-semibold text-brand-navy")}
              >
                <span aria-hidden="true">{localeInfo(l.code).flag}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
