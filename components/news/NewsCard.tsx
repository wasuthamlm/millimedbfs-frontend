import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import type { NewsView as NewsItem } from "@/lib/post-view";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-100 p-3 transition-shadow hover:shadow-md">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32">
        <Image src={item.image} alt={item.title} fill sizes="(min-width: 640px) 128px, 112px" className="object-cover" />
      </div>
      <div className="flex flex-col justify-between">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
          {item.title}
        </h3>
        <Link
          href={`/news/${item.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
        >
          อ่านต่อ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
