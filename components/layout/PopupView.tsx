import Image from "next/image";
import type { TargetAndTransition } from "framer-motion";
import { X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// One popup card (no visibility logic) — shared by the public <Popups> and the
// admin preview. Ported from the legacy HomePopup / PopupPreview.

export type PopupItem = {
  id: string;
  titleTh: string | null;
  titleEn: string | null;
  bodyTh: string | null;
  bodyEn: string | null;
  imageUrl: string | null;
  buttonLabelTh: string | null;
  buttonLabelEn: string | null;
  link: string | null;
  openInNewTab: boolean;
  layout: string;
  animation: string;
  size: string;
  delaySeconds: number;
  frequency: string;
  homeOnly: boolean;
  startDate: string | null;
  endDate: string | null;
};

const SIZES: Record<string, string> = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

export const POPUP_ANIMATIONS: Record<string, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } },
  "slide-up": { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 40 } },
  "slide-down": { initial: { opacity: 0, y: -60 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -40 } },
  bounce: {
    initial: { opacity: 0, scale: 0.6 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 14 } },
    exit: { opacity: 0, scale: 0.8 },
  },
};

export function PopupCard({ popup, lang = "th", onClose }: { popup: PopupItem; lang?: "th" | "en"; onClose?: () => void }) {
  const title = (lang === "en" && popup.titleEn) || popup.titleTh || "";
  const body = (lang === "en" && popup.bodyEn) || popup.bodyTh || "";
  const button = (lang === "en" && popup.buttonLabelEn) || popup.buttonLabelTh || "";
  const layout = popup.imageUrl ? popup.layout : "text-only";
  const newTab = popup.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  const image = popup.imageUrl && layout !== "text-only" && (
    <div className={cn("relative overflow-hidden bg-slate-100", layout === "image-left" ? "min-h-48 w-full sm:w-2/5" : "aspect-[4/3] w-full")}>
      <Image src={popup.imageUrl} alt={title} fill sizes="640px" className="object-cover" />
    </div>
  );
  const text = layout !== "image-only" && (title || body || (button && popup.link)) && (
    <div className="flex flex-1 flex-col gap-2 p-5 text-center">
      {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
      {body && <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{body}</p>}
      {button && popup.link && (
        <a
          href={popup.link}
          {...newTab}
          onClick={onClose}
          className="mt-2 inline-flex items-center justify-center self-center rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-hover"
        >
          {button}
        </a>
      )}
    </div>
  );

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl", SIZES[popup.size] ?? SIZES.md)}>
      {onClose && (
        <button
          type="button"
          aria-label={lang === "en" ? "Close" : "ปิด"}
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow hover:text-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className={cn("flex", layout === "image-left" ? "flex-col sm:flex-row" : "flex-col")}>
        {layout === "image-only" && popup.link ? (
          <a href={popup.link} {...newTab} onClick={onClose} className="block w-full">
            {image}
          </a>
        ) : (
          image
        )}
        {text}
      </div>
    </div>
  );
}
