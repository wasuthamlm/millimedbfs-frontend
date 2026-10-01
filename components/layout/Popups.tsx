"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PopupCard, POPUP_ANIMATIONS, type PopupItem } from "@/components/layout/PopupView";
import { splitLocale } from "@/lib/i18n/locales";

const storageKey = (id: string) => `millimedbfs_popup_${id}`;

function allowedByFrequency(popup: PopupItem): boolean {
  try {
    if (popup.frequency === "always") return true;
    const store = popup.frequency === "once_per_session" ? sessionStorage : localStorage;
    const last = store.getItem(storageKey(popup.id));
    if (!last) return true;
    if (popup.frequency === "once_per_day") return new Date(last).toDateString() !== new Date().toDateString();
    return false;
  } catch {
    return true;
  }
}

function markShown(popup: PopupItem) {
  try {
    const store = popup.frequency === "once_per_session" ? sessionStorage : localStorage;
    store.setItem(storageKey(popup.id), new Date().toISOString());
  } catch {
    /* storage blocked — the popup may show again, which is harmless */
  }
}

/**
 * Shows the first eligible popup (published, active, inside its date window,
 * allowed on this page and by its frequency) after its delay. Multi-popup
 * version of the legacy HomePopup.
 */
export function Popups({ popups, lang = "th" }: { popups: PopupItem[]; lang?: "th" | "en" }) {
  const pathname = usePathname();
  const [current, setCurrent] = useState<PopupItem | null>(null);

  useEffect(() => {
    const isHome = splitLocale(pathname || "/").path === "/";
    const now = new Date();
    const next = popups.find(
      (p) =>
        (!p.homeOnly || isHome) &&
        (!p.startDate || now >= new Date(p.startDate)) &&
        (!p.endDate || now <= new Date(`${p.endDate.slice(0, 10)}T23:59:59`)) &&
        allowedByFrequency(p),
    );
    if (!next) return;
    const timer = window.setTimeout(() => {
      setCurrent(next);
      markShown(next);
    }, Math.max(0, next.delaySeconds) * 1000);
    return () => window.clearTimeout(timer);
  }, [popups, pathname]);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCurrent(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  const anim = POPUP_ANIMATIONS[current?.animation ?? "zoom"] ?? POPUP_ANIMATIONS.zoom;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setCurrent(null)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div {...anim} className="flex w-full justify-center" onClick={(e) => e.stopPropagation()}>
            <PopupCard popup={current} lang={lang} onClose={() => setCurrent(null)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
