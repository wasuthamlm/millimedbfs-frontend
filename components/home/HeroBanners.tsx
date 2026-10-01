"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { splitLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui";
import { videoSource, youtubeThumbnail } from "@/lib/video-embed";

export type HeroBannerItem = {
  id: string;
  titleTh: string;
  altText?: string | null;
  image: string;
  link: string | null;
  /** "image" (default) | "video" (uploaded file) | "youtube" | "vimeo" */
  mediaType?: "image" | "video" | "youtube" | "vimeo";
  videoUrl?: string | null;
};

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/** Click-to-play embed: YouTube/Vimeo iframes are only loaded once the visitor asks for them. */
function EmbedSlide({ item, onStart }: { item: HeroBannerItem; onStart: () => void }) {
  const [started, setStarted] = useState(false);
  const source = videoSource(item.videoUrl);
  const poster = item.image || youtubeThumbnail(item.videoUrl);
  if (!source) return null;
  if (!started) {
    return (
      <button
        type="button"
        aria-label={`เล่นวิดีโอ ${item.titleTh}`}
        onClick={() => {
          setStarted(true);
          onStart();
        }}
        className="relative block aspect-video w-full bg-slate-900"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poster && <img src={poster} alt={item.altText || item.titleTh} className="h-full w-full object-cover" />}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white">
            <PlayIcon className="ml-1 h-7 w-7" />
          </span>
        </span>
      </button>
    );
  }
  const src = source.kind === "iframe" ? `${source.src}${source.src.includes("?") ? "&" : "?"}autoplay=1&mute=1` : source.src;
  return source.kind === "iframe" ? (
    <iframe src={src} title={item.titleTh || "video"} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
  ) : (
    <video src={src} controls autoPlay className="aspect-video w-full" />
  );
}

/** Uploaded clip: plays silently in a loop like a background, but only while it's the visible banner. */
function VideoSlide({ item, active }: { item: HeroBannerItem; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) video.play().catch(() => {});
    else video.pause();
  }, [active]);
  return (
    <video
      ref={ref}
      src={item.videoUrl ?? undefined}
      poster={item.image || undefined}
      aria-label={item.altText || item.titleTh}
      muted
      loop
      playsInline
      preload={active ? "auto" : "metadata"}
      className="block aspect-video h-auto w-full object-cover"
    />
  );
}

export type HeroBannerConfig = {
  transitionEffect: string;
  direction: string;
  transitionSpeedMs: number;
  displayDurationMs: number;
  autoplay: boolean;
  loop: boolean;
  pauseOnHover: boolean;
  showArrows: boolean;
  /** Shows the thumbnail strip (the field predates thumbnails, when it drew dots). */
  showDots: boolean;
};

const DEFAULT_CONFIG: HeroBannerConfig = {
  transitionEffect: "fade",
  direction: "ltr",
  transitionSpeedMs: 500,
  displayDurationMs: 5000,
  autoplay: false,
  loop: true,
  pauseOnHover: true,
  showArrows: true,
  showDots: true,
};

export function HeroBanners({
  banners,
  config = DEFAULT_CONFIG,
}: {
  banners: HeroBannerItem[];
  config?: HeroBannerConfig;
}) {
  const [index, setIndex] = useState(0);
  const { locale } = splitLocale(usePathname() || "/");
  const [paused, setPaused] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const atLastSlide = index === banners.length - 1;
  const canAutoAdvance = config.autoplay && !paused && (config.loop || !atLastSlide);

  useEffect(() => {
    if (banners.length < 2 || !canAutoAdvance) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, config.displayDurationMs);
    return () => clearInterval(timer);
  }, [banners.length, canAutoAdvance, config.displayDurationMs]);

  // Keep the selected thumbnail in view. Scrolls only the strip — scrollIntoView
  // would also scroll the page.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" });
  }, [index]);

  if (banners.length === 0) return null;

  const goTo = (next: number) => {
    if (config.loop) {
      setIndex((next + banners.length) % banners.length);
      return;
    }
    setIndex(Math.min(Math.max(next, 0), banners.length - 1));
  };

  const renderSlide = (item: HeroBannerItem, active: boolean, i: number) => {
    const type = item.mediaType ?? "image";
    // Plain <img>, not next/image: with no width/height attrs, "w-full h-auto"
    // sizes to the file's own true aspect ratio, so the banner always fills the
    // width with no crop and no side gaps, whatever aspect ratio it happens to be.
    const media =
      type === "video" ? (
        <VideoSlide item={item} active={active} />
      ) : type === "youtube" || type === "vimeo" ? (
        // Remounts when it leaves the stage, which stops a playing embed.
        <EmbedSlide key={active ? "on" : "off"} item={item} onStart={() => setPaused(true)} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.altText || item.titleTh}
          loading={i === 0 ? "eager" : "lazy"}
          className="block h-auto w-full"
        />
      );
    if (!item.link || type === "youtube" || type === "vimeo") return media;
    return /^https?:\/\//.test(item.link) ? (
      <a href={item.link} target="_blank" rel="noopener noreferrer" tabIndex={active ? undefined : -1}>
        {media}
      </a>
    ) : (
      <Link href={item.link} tabIndex={active ? undefined : -1}>
        {media}
      </Link>
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-100"
      onMouseEnter={() => config.pauseOnHover && setPaused(true)}
      onMouseLeave={() => config.pauseOnHover && setPaused(false)}
    >
      {/* Every banner stays mounted, stacked in one grid cell, and only opacity
          changes — no unmount/remount, so no blank flash and no height jump. */}
      <div className="grid">
        {banners.map((item, i) => {
          const active = i === index;
          return (
            <div
              key={item.id}
              aria-hidden={!active}
              className={cn(
                "col-start-1 row-start-1 transition-opacity ease-in-out",
                active ? "z-10 opacity-100" : "pointer-events-none opacity-0"
              )}
              style={{ transitionDuration: `${config.transitionSpeedMs}ms` }}
            >
              {renderSlide(item, active, i)}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && config.showArrows && (
        <>
          <button
            type="button"
            aria-label={ui(locale, "prevSlide")}
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-navy shadow-md transition-colors hover:bg-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label={ui(locale, "nextSlide")}
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-navy shadow-md transition-colors hover:bg-white"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}

      {banners.length > 1 && config.showDots && (
        <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center px-3 sm:bottom-4">
          <div
            ref={stripRef}
            className="flex max-w-full gap-1.5 overflow-x-auto rounded-lg p-1 [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
          >
            {banners.map((banner, i) => {
              const active = i === index;
              const thumb = banner.image || youtubeThumbnail(banner.videoUrl);
              return (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`ไปที่สไลด์ ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative h-9 w-14 shrink-0 overflow-hidden rounded-md bg-slate-800 shadow-md ring-2 transition-all sm:h-14 sm:w-24",
                    active ? "opacity-100 ring-white" : "opacity-50 ring-transparent hover:opacity-90"
                  )}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-white">
                      <PlayIcon className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
