"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/i18n/ui";

export type GalleryItem = { url: string; alt: string };

/** Featured image + thumbnails + lightbox (legacy ProductGallery). */
export function ProductGallery({ images, locale = "th" }: { images: GalleryItem[]; locale?: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const count = images.length;
  const go = (dir: 1 | -1) => setActive((i) => (i + dir + count) % count);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, count]);

  if (count === 0) {
    return <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-site-bg text-sm text-slate-300">{ui(locale, "noImage")}</div>;
  }
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-site-bg"
        aria-label={ui(locale, "enlargeImage")}
      >
        <Image src={current.url} alt={current.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" priority />
        {count > 1 && (
          <>
            <span
              role="button"
              aria-label={ui(locale, "prevImage")}
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-lg shadow"
            >
              ‹
            </span>
            <span
              role="button"
              aria-label={ui(locale, "nextImage")}
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-lg shadow"
            >
              ›
            </span>
          </>
        )}
      </button>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`รูปที่ ${i + 1}`}
              className={cn("relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2", i === active ? "border-brand-navy" : "border-transparent opacity-70 hover:opacity-100")}
            >
              <Image src={img.url} alt={img.alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(false)} role="dialog" aria-modal="true">
          <div className="relative h-full max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {active + 1} / {count}
          </span>
          {count > 1 && (
            <>
              <button type="button" aria-label={ui(locale, "prevImage")} onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl text-white">‹</button>
              <button type="button" aria-label={ui(locale, "nextImage")} onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl text-white">›</button>
            </>
          )}
          <button type="button" aria-label={ui(locale, "close")} onClick={() => setLightbox(false)} className="absolute right-4 top-4 text-3xl text-white">×</button>
        </div>
      )}
    </div>
  );
}
