"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { staggerContainer } from "@/lib/motion";
import { articles } from "@/data/articles";

export function ArticlesGrid() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading title="บทความน่ารู้" centered />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
        >
          {articles.slice(0, 8).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
