import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { videoSource } from "@/lib/video-embed";
import type { AboutCard, CtaButtons, LayoutColumn } from "@/lib/sections";
import { RichText } from "./SectionShell";
import { ui } from "@/lib/i18n/ui";
import { TrackedVideo } from "@/components/analytics/TrackedVideo";

// Presentational page-builder pieces — no data fetching and no hooks, so the
// same markup renders on the public site (server) and in the admin preview (client).

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/i.test(href);

export function VideoEmbed({ url, width = 100, title }: { url?: string; width?: number; title?: string }) {
  const src = videoSource(url);
  if (!src) return url ? <p className="text-sm text-slate-400">ไม่รองรับลิงก์วิดีโอนี้ (ใช้ YouTube, Vimeo หรือไฟล์ .mp4)</p> : null;
  return (
    <div className="mx-auto w-full" style={{ maxWidth: `${Math.min(100, Math.max(30, width))}%` }}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {src.kind === "iframe" ? (
          <iframe
            src={src.src}
            title={title || "วิดีโอ"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <TrackedVideo src={src.src} className="absolute inset-0 h-full w-full" />
        )}
      </div>
    </div>
  );
}

export function CtaButtonsRow({ cta, lang = "th", align = "left" }: { cta?: CtaButtons; lang?: "th" | "en"; align?: string }) {
  if (!cta) return null;
  const primaryLabel = (lang === "en" && cta.primaryLabelEn) || cta.primaryLabelTh;
  const secondaryLabel = (lang === "en" && cta.secondaryLabelEn) || cta.secondaryLabelTh;
  const link = (href: string, label: string, primary: boolean) => {
    const cls = cn(
      "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
      primary ? "bg-brand-navy text-white hover:bg-brand-navy-hover" : "border border-brand-navy text-brand-navy hover:bg-brand-navy/5",
    );
    const newTab = cta.newTab && !/^(tel|mailto):/i.test(href);
    return isExternal(href) || newTab ? (
      <a href={href} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {label}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  };
  return (
    <div className={cn("mt-6 flex flex-wrap gap-3", align === "center" && "justify-center", align === "right" && "justify-end")}>
      {primaryLabel && cta.primaryUrl && link(cta.primaryUrl, primaryLabel, true)}
      {secondaryLabel && cta.secondaryUrl && link(cta.secondaryUrl, secondaryLabel, false)}
    </div>
  );
}

export function TextImage({ html, imageUrl, alt, position = "left" }: { html?: string; imageUrl?: string; alt: string; position?: "left" | "right" | "top" }) {
  const image = imageUrl ? (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-100">
      <Image src={imageUrl} alt={alt} width={1600} height={1000} unoptimized className="h-auto w-full object-contain" />
    </div>
  ) : null;
  if (!image || position === "top") {
    return (
      <div className="flex flex-col gap-6">
        {image}
        <RichText html={html} />
      </div>
    );
  }
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className={cn(position === "right" && "md:order-2")}>{image}</div>
      <RichText html={html} />
    </div>
  );
}

const GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
};

export function GalleryGrid({ urls, columns = 3, alt }: { urls: string[]; columns?: number; alt: string }) {
  if (!urls.length) return null;
  return (
    <div className={cn("grid gap-3", GRID[columns] ?? GRID[3])}>
      {urls.map((url, i) => (
        <a key={`${url}-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden rounded-xl bg-slate-100">
          <Image src={url} alt={`${alt} ${i + 1}`} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform hover:scale-105" />
        </a>
      ))}
    </div>
  );
}

export function TextColumns({ html, columns = 2 }: { html?: string; columns?: number }) {
  // CSS multi-column flow, like the legacy COL_CLASS.
  const cols = columns >= 3 ? "md:columns-3" : columns === 2 ? "md:columns-2" : "";
  return <RichText html={html} className={cn("gap-10", cols)} />;
}

const GAP: Record<string, string> = { sm: "gap-4", md: "gap-8", lg: "gap-12" };
const ITEMS: Record<string, string> = { start: "md:items-start", center: "md:items-center", end: "md:items-end" };

export function LayoutColumns({
  columns,
  gap = "md",
  align = "center",
  stackOnMobile = true,
  lang = "th",
}: {
  columns: LayoutColumn[];
  gap?: string;
  align?: string;
  stackOnMobile?: boolean;
  lang?: "th" | "en";
}) {
  return (
    <div className={cn("flex", stackOnMobile ? "flex-col md:flex-row" : "flex-row", GAP[gap] ?? GAP.md, ITEMS[align] ?? ITEMS.center)}>
      {columns.map((col, i) => (
        <div key={i} className="min-w-0" style={{ flex: `${Math.min(4, Math.max(1, col.width || 1))} 1 0%` }}>
          {col.kind === "text" && <RichText html={(lang === "en" && col.bodyEn) || col.bodyTh} />}
          {col.kind === "image" && col.imageUrl && (
            <Image src={col.imageUrl} alt="" width={1200} height={800} unoptimized className="h-auto w-full rounded-xl object-contain" />
          )}
          {col.kind === "video" && <VideoEmbed url={col.videoUrl} />}
          {col.kind === "cta" && <CtaButtonsRow cta={col.cta} lang={lang} />}
        </div>
      ))}
    </div>
  );
}

export function DownloadButton({ url, label }: { url?: string; label: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-navy-hover"
    >
      ⬇ {label || "ดาวน์โหลด"}
    </a>
  );
}

export function AboutCards({ cards, columns = 3, lang = "th" }: { cards: AboutCard[]; columns?: number; lang?: "th" | "en" }) {
  const visible = cards.filter((c) => c.titleTh || c.bodyTh || c.imageUrl);
  if (!visible.length) return null;
  return (
    <div className={cn("grid gap-6 text-left", GRID[columns] ?? GRID[3])}>
      {visible.map((card, i) => {
        const body = (
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {card.imageUrl && (
              <div className="relative aspect-[4/3]">
                <Image src={card.imageUrl} alt={card.titleTh} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-2 p-5">
              <h3 className="text-lg font-bold text-slate-900">{(lang === "en" && card.titleEn) || card.titleTh}</h3>
              <RichText html={(lang === "en" && card.bodyEn) || card.bodyTh} className="text-sm text-slate-600" />
            </div>
          </div>
        );
        return card.href ? (
          <Link key={i} href={card.href} className="block transition-shadow hover:shadow-md">
            {body}
          </Link>
        ) : (
          <div key={i}>{body}</div>
        );
      })}
    </div>
  );
}

export type ContactInfoData = {
  companyName?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  lineId?: string | null;
  taxId?: string | null;
  mapEmbedSrc?: string | null;
};

export function ContactInfoBlock({ info, locale = "th" }: { info: ContactInfoData; locale?: string }) {
  const rows: [string, React.ReactNode][] = [];
  if (info.address) rows.push([ui(locale, "address"), <span key="a" className="whitespace-pre-line">{info.address}</span>]);
  if (info.phone) rows.push([ui(locale, "phone"), <a key="p" href={`tel:${info.phone.replace(/[^\d+]/g, "")}`} className="text-brand-navy hover:underline">{info.phone}</a>]);
  if (info.email) rows.push([ui(locale, "email"), <a key="e" href={`mailto:${info.email}`} className="text-brand-navy hover:underline">{info.email}</a>]);
  if (info.lineId) rows.push(["LINE", info.lineId]);
  if (info.taxId) rows.push([ui(locale, "taxId"), info.taxId]);
  return (
    <div className="grid gap-8 text-left md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {info.companyName && <p className="text-lg font-bold text-slate-900">{info.companyName}</p>}
        <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-slate-400">{label}</dt>
              <dd className="text-slate-700">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {info.mapEmbedSrc && (
        <iframe
          src={info.mapEmbedSrc}
          title={ui(locale, "map")}
          className="h-72 w-full rounded-xl border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
    </div>
  );
}
