"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroBannerItem = {
  id: string;
  titleTh: string;
  image: string;
  link: string | null;
};

export function HeroBanners({ banners }: { banners: HeroBannerItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[index];
  const slide = (
    <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
      <Image
        src={current.image}
        alt={current.titleTh}
        fill
        priority
        className="object-cover"
      />
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {current.link ? (
            <Link href={current.link}>{slide}</Link>
          ) : (
            slide
          )}
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
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
