import Link from "next/link";
import { ArrowRight } from "./icons";
import { ui } from "@/lib/i18n/ui";

export function SectionHeading({
  title,
  viewAllHref,
  centered = false,
  locale = "th",
}: {
  title: string;
  viewAllHref?: string;
  centered?: boolean;
  locale?: string;
}) {
  return (
    <div
      className={
        centered
          ? "flex flex-col items-center gap-2 text-center"
          : "flex items-center justify-between gap-4"
      }
    >
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
      {centered && (
        <span className="h-1 w-16 rounded-full bg-brand-gold" aria-hidden="true" />
      )}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-navy transition-colors hover:text-brand-gold-dark"
        >
          {ui(locale, "readAll")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
