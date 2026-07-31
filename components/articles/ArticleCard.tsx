"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import type { Article } from "@/data/articles";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link href={`/articles/${article.slug}`} className="group block">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-xl border border-slate-100 shadow-sm transition-shadow group-hover:shadow-lg"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </motion.div>
        <h3 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900">
          {article.title}
        </h3>
      </Link>
    </motion.div>
  );
}
