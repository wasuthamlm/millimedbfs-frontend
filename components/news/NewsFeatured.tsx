"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import type { NewsView as NewsItem } from "@/lib/post-view";

export function NewsFeatured({ item }: { item: NewsItem }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Link
        href={`/news/${item.slug}`}
        className="group block overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>
      </Link>
    </motion.div>
  );
}
