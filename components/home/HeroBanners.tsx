"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type HeroBannerItem = {
  id: string;
  titleTh: string;
  altText?: string | null;
  image: string;
  link: string | null;
};

export type HeroBannerConfig = {
  transitionEffect: string;
  direction: string;
  transitionSpeedMs: number;
  displayDurationMs: number;
  autoplay: boolean;
  loop: boolean;
  pauseOnHover: boolean;
  showArrows: boolean;
  showDots: boolean;
};

const DEFAULT_CONFIG: HeroBannerConfig = {
  transitionEffect: "fade",
  direction: "ltr",
  transitionSpeedMs: 500,
  displayDurationMs: 5000,
  autoplay: true,
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
  const [paused, setPaused] = useState(false);

  const atLastSlide = index === banners.length - 1;
  const canAutoAdvance = config.autoplay && !paused && (config.loop || !atLastSlide);

  useEffect(() => {
    if (banners.length < 2 || !canAutoAdvance) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, config.displayDurationMs);
    return () => clearInterval(timer);
  }, [banners.length, canAutoAdvance, config.displayDurationMs]);

  if (banners.length === 0) return null;

  const goTo = (next: number) => {
    if (config.loop) {
      setIndex((next + banners.length) % banners.length);
      return;
    }
    setIndex(Math.min(Math.max(next, 0), banners.length - 1));
  };

  const current = banners[index];
  const isSlideEffect = config.transitionEffect === "slide";
  const slideDirection = config.direction === "rtl" ? -1 : 1;
  const transitionSeconds = config.transitionSpeedMs / 1000;

  // Plain <img>, not next/image: with no width/height attrs, "w-full h-auto"
  // sizes to the file's own true aspect ratio, so the banner always fills the
  // width with no crop and no side gaps, whatever aspect ratio it happens to be.
  const slide = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={current.image} alt={current.altText || current.titleTh} className="block h-auto w-full" />
  );

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-100"
      onMouseEnter={() => config.pauseOnHover && setPaused(true)}
      onMouseLeave={() => config.pauseOnHover && setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={isSlideEffect ? { opacity: 1, x: 40 * slideDirection } : { opacity: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={isSlideEffect ? { opacity: 1, x: -40 * slideDirection } : { opacity: 0 }}
          transition={{ duration: transitionSeconds }}
        >
          {current.link ? <Link href={current.link}>{slide}</Link> : slide}
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && config.showArrows && (
        <>
          <button
            type="button"
            aria-label="สไลด์ก่อนหน้า"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-navy shadow-md transition-colors hover:bg-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label="สไลด์ถัดไป"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-navy shadow-md transition-colors hover:bg-white"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}

      {banners.length > 1 && config.showDots && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`ไปที่สไลด์ ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
