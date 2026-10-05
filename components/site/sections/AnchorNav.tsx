"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Height of the site header when it is pinned while scrolling, else 0. */
function pinnedHeaderOffset() {
  const header = document.querySelector("header");
  if (!header) return 0;
  const { position } = getComputedStyle(header);
  return position === "sticky" || position === "fixed" ? header.getBoundingClientRect().height : 0;
}

/** In-page link bar (ANCHOR_NAV block): each link smooth-scrolls to the block with that Anchor ID. */
export function AnchorNav({ links, light, label }: { links: { label: string; anchorId: string }[]; light?: boolean; label?: string }) {
  // Anchor IDs whose block isn't rendered on this device (hidden by device visibility) — their links do nothing, so hide them.
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      const next = new Set<string>();
      for (const l of links) {
        const el = l.anchorId ? document.getElementById(l.anchorId) : null;
        if (el && el.offsetParent === null && getComputedStyle(el).position !== "fixed") next.add(l.anchorId);
      }
      setHidden(next);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [links]);

  const visible = links.filter((l) => !hidden.has(l.anchorId));
  if (!visible.length) return null;

  const go = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    const target = document.getElementById(anchorId);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - pinnedHeaderOffset() - 8;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${anchorId}`);
  };

  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max min-w-full justify-center gap-x-8 gap-y-2 sm:w-auto sm:flex-wrap">
        {visible.map((l, i) => (
          <li key={i} className="shrink-0">
            <a
              href={`#${l.anchorId}`}
              onClick={(e) => go(e, l.anchorId)}
              className={cn(
                "inline-block whitespace-nowrap py-2 text-base transition-colors",
                light ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-brand-navy",
              )}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
