"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import type { ArticleView as Article } from "@/lib/post-view";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link href={`/articles/${article.slug}`} className="group block h-full">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition-shadow group-hover:shadow-lg"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 items-start p-4">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">
              {article.title}
            </h3>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
