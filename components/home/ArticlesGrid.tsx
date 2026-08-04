"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { staggerContainer } from "@/lib/motion";
import type { ArticleView } from "@/lib/post-view";
import { cn } from "@/lib/utils";

const COLUMN_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function ArticlesGrid({
  title = "บทความน่ารู้",
  items,
  columns = 4,
}: {
  title?: string;
  items: ArticleView[];
  columns?: number;
}) {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading title={title} centered />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className={cn("grid gap-6", COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[4])}
        >
          {items.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
