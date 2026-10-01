import { cn } from "@/lib/utils";

// Admin-built floating buttons (ported from the legacy FloatingWidgets):
// phone / LINE / link / sign-up / log-in, grouped by screen position.

export type FloatingWidget = {
  id: string;
  labelTh: string;
  labelEn: string | null;
  type: string;
  icon: string;
  link: string | null;
  phone: string | null;
  position: string;
  design: string;
  color: string;
  openInNewTab: boolean;
};

const ICON_PATHS: Record<string, string> = {
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm18 2-10 7L2 6",
  "user-plus": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm11-3v6m3-3h-6",
  "log-in": "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
  "shopping-bag": "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  "external-link": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};

export function WidgetIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICON_PATHS[name] ?? ICON_PATHS["external-link"]} />
    </svg>
  );
}

const POSITIONS: Record<string, string> = {
  "bottom-right": "bottom-6 right-6 items-end",
  "bottom-left": "bottom-6 left-6 items-start",
  "middle-right": "right-4 top-1/2 -translate-y-1/2 items-end",
  "middle-left": "left-4 top-1/2 -translate-y-1/2 items-start",
};

export function FloatingButton({ widget, lang = "th" }: { widget: FloatingWidget; lang?: "th" | "en" }) {
  const label = (lang === "en" && widget.labelEn) || widget.labelTh;
  const href = widget.type === "phone" ? `tel:${(widget.phone ?? "").replace(/[^\d+]/g, "")}` : widget.link ?? "#";
  const newTab = widget.openInNewTab && widget.type !== "phone";
  const iconOnly = widget.design === "circle" || widget.design === "square";
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(widget.type === "line" ? { "data-line-click": "floating-widget" } : {})}
      style={widget.design === "minimal" ? { color: widget.color, borderColor: widget.color } : { backgroundColor: widget.color }}
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm font-semibold shadow-lg transition-transform hover:scale-105",
        widget.design === "pill" && "rounded-full px-4 py-3 text-white",
        widget.design === "circle" && "h-14 w-14 rounded-full text-white",
        widget.design === "square" && "h-14 w-14 rounded-xl text-white",
        widget.design === "minimal" && "rounded-full border-2 bg-white px-4 py-2.5",
      )}
    >
      <WidgetIcon name={widget.icon} className="h-5 w-5 shrink-0" />
      {!iconOnly && <span>{label}</span>}
    </a>
  );
}

export function FloatingWidgets({ widgets, lang = "th" }: { widgets: FloatingWidget[]; lang?: "th" | "en" }) {
  if (!widgets.length) return null;
  const groups = new Map<string, FloatingWidget[]>();
  for (const w of widgets) groups.set(w.position, [...(groups.get(w.position) ?? []), w]);
  return (
    <>
      {[...groups].map(([position, items]) => (
        <div key={position} className={cn("fixed z-40 flex flex-col gap-3", POSITIONS[position] ?? POSITIONS["bottom-right"])}>
          {items.map((w) => (
            <FloatingButton key={w.id} widget={w} lang={lang} />
          ))}
        </div>
      ))}
    </>
  );
}
