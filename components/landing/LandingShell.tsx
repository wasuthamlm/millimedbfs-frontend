"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "@/components/ui/icons";
import { WidgetIcon } from "@/components/layout/FloatingWidgets";
import { cn } from "@/lib/utils";
import {
  LANDING_PREVIEW_MESSAGE,
  LANDING_PREVIEW_READY,
  landingThemeStyle,
  safeLandingUrl,
  type LandingBackground,
  type LandingFaqItem,
  type LandingFooterConfig,
  type LandingHeaderConfig,
  type LandingLink,
  type LandingPreviewConfig,
  type LandingWidgetConfig,
} from "@/lib/landing";

type SiteColors = { colorPrimary?: string; colorAccent?: string } | null;

function linkProps(link: { url: string; newTab?: boolean }) {
  const href = safeLandingUrl(link.url);
  return { href, ...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {}) };
}

/** Solid colour with an optional image layer whose opacity doesn't fade the content. */
function Background({ bg }: { bg: LandingBackground }) {
  if (!bg.imageUrl) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url("${bg.imageUrl.replace(/"/g, "%22")}")`, opacity: bg.imageOpacity ?? 0.35 }}
    />
  );
}

function LandingHeader({ cfg }: { cfg: LandingHeaderConfig }) {
  const [open, setOpen] = useState(false);
  if (!cfg.enabled) return null;
  const links = cfg.links.filter((l) => l.label);
  const hasCta = !!cfg.ctaLabel;
  const cta = { url: cfg.ctaUrl, newTab: cfg.ctaNewTab };

  return (
    <header
      className={cn("relative z-40 w-full border-b border-black/5 shadow-sm", cfg.sticky && "sticky top-0")}
      style={{ backgroundColor: cfg.bg.color || undefined, color: cfg.textColor }}
    >
      <Background bg={cfg.bg} />
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:h-16">
        <a href="#top" className="flex min-w-0 shrink-0 items-center gap-2">
          {cfg.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cfg.logoUrl} alt={cfg.logoText || "logo"} className="h-8 w-auto object-contain md:h-9" />
          ) : (
            <span className="truncate text-base font-bold md:text-lg">{cfg.logoText}</span>
          )}
        </a>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l, i) => (
            <a key={i} {...linkProps(l)} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5">
              {l.label}
            </a>
          ))}
          {hasCta && (
            <a {...linkProps(cta)} className="ml-2 whitespace-nowrap rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              {cfg.ctaLabel}
            </a>
          )}
        </nav>
        {(links.length > 0 || hasCta) && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            className="ml-auto rounded-lg p-2 hover:bg-black/5 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>
      {open && (
        <div className="relative space-y-1 border-t border-black/5 px-4 py-3 md:hidden" style={{ backgroundColor: cfg.bg.color || undefined }}>
          {links.map((l, i) => (
            <a key={i} {...linkProps(l)} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5">
              {l.label}
            </a>
          ))}
          {hasCta && (
            <a {...linkProps(cta)} onClick={() => setOpen(false)} className="block rounded-full bg-brand-navy px-4 py-2.5 text-center text-sm font-semibold text-white">
              {cfg.ctaLabel}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function LandingFooter({ cfg, safeTextHtml }: { cfg: LandingFooterConfig; safeTextHtml: string | null }) {
  if (!cfg.enabled) return null;
  const links = cfg.links.filter((l: LandingLink) => l.label);
  return (
    <footer className="relative mt-auto w-full" style={{ backgroundColor: cfg.bg.color || undefined, color: cfg.textColor }}>
      <Background bg={cfg.bg} />
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 md:max-w-md">
            {cfg.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cfg.logoUrl} alt="logo" className="mb-3 h-9 w-auto object-contain" />
            )}
            {safeTextHtml !== null ? (
              <div className="prose prose-sm max-w-none text-sm text-inherit opacity-70 [&_a]:underline" dangerouslySetInnerHTML={{ __html: safeTextHtml }} />
            ) : (
              // Live preview: unsaved text is shown as plain text until it's saved and sanitized on the server.
              cfg.text && <p className="whitespace-pre-line text-sm opacity-70">{cfg.text.replace(/<[^>]*>/g, " ")}</p>
            )}
          </div>
          {links.length > 0 && (
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map((l, i) => (
                <a key={i} {...linkProps(l)} className="text-sm opacity-70 transition-opacity hover:opacity-100">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </div>
        <div className="mt-6 border-t border-current/10 pt-5 text-center text-xs opacity-50 md:text-left">
          {cfg.copyright || `© ${new Date().getFullYear()}`}
        </div>
      </div>
    </footer>
  );
}

const WIDGET_POSITIONS: Record<LandingWidgetConfig["position"], string> = {
  "middle-right": "right-3 sm:right-5 top-1/2 -translate-y-1/2 items-end",
  "middle-left": "left-3 sm:left-5 top-1/2 -translate-y-1/2 items-start",
  "bottom-right": "right-3 sm:right-5 bottom-4 sm:bottom-6 items-end",
  "bottom-left": "left-3 sm:left-5 bottom-4 sm:bottom-6 items-start",
};

function LandingWidget({ cfg }: { cfg: LandingWidgetConfig }) {
  const [open, setOpen] = useState(false);
  const items = cfg.items.filter((i) => i.label);
  if (!cfg.enabled || items.length === 0) return null;
  const circle = cfg.design === "circle";
  const radius = cfg.design === "square" ? "12px" : "9999px";

  return (
    <div className={cn("fixed z-40 flex flex-col gap-2", WIDGET_POSITIONS[cfg.position] ?? WIDGET_POSITIONS["middle-right"])}>
      <div className={cn("flex flex-col gap-2 transition-all duration-200", open ? "opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0")}>
        {items.map((item, i) => {
          const href =
            item.icon === "phone" && item.url && !/^(https?:|tel:|mailto:|\/|#)/i.test(item.url)
              ? `tel:${item.url.replace(/[^\d+]/g, "")}`
              : safeLandingUrl(item.url);
          return (
            <a
              key={i}
              href={href}
              title={item.label}
              {...(item.newTab !== false && href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                backgroundColor: item.color || cfg.color,
                color: cfg.textColor,
                borderRadius: radius,
                padding: circle ? 0 : "0.6rem 0.9rem",
                width: circle ? "2.75rem" : undefined,
                height: circle ? "2.75rem" : undefined,
              }}
            >
              <WidgetIcon name={item.icon} className="h-5 w-5 shrink-0" />
              {!circle && <span className="hidden whitespace-nowrap text-sm font-semibold sm:inline">{item.label}</span>}
            </a>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "ปิดเมนูด่วน" : "เปิดเมนูด่วน"}
        className="flex h-11 w-11 items-center justify-center shadow-lg transition-all hover:shadow-xl sm:h-12 sm:w-12"
        style={{ backgroundColor: cfg.color, color: cfg.textColor, borderRadius: radius }}
      >
        {open ? <X className="h-5 w-5" /> : <span className="text-2xl leading-none">+</span>}
      </button>
    </div>
  );
}

function LandingFaq({ items, lang }: { items: LandingFaqItem[]; lang: string }) {
  const en = lang === "en";
  const list = items
    .map((f) => ({ q: (en && f.qEn) || f.qTh, a: (en && f.aEn) || f.aTh }))
    .filter((f) => f.q && f.a);
  const [openIdx, setOpenIdx] = useState(0);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h2 className="mb-5 text-center text-xl font-bold md:mb-6 md:text-2xl">{en ? "Frequently asked questions" : "คำถามที่พบบ่อย"}</h2>
      <div className="space-y-2.5">
        {list.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-current/10 bg-white/60">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-semibold md:text-base">{f.q}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-brand-navy transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed opacity-70">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Landing page chrome (header / footer / widget / FAQ / colours) around the server-rendered
 * sections. In preview mode the admin editor pushes unsaved settings in via postMessage.
 */
export function LandingShell({
  initial,
  footerHtml,
  siteColors,
  preview,
  lang,
  children,
}: {
  initial: LandingPreviewConfig;
  footerHtml: string;
  siteColors: SiteColors;
  preview: boolean;
  lang: string;
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState(initial);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (!preview || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== LANDING_PREVIEW_MESSAGE || !e.data.config) return;
      setConfig(e.data.config as LandingPreviewConfig);
      setEdited(true);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: LANDING_PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  // Saved footer text was sanitized on the server; edited-but-unsaved text is shown as plain text.
  const footerText = edited && config.footer.text !== initial.footer.text ? null : footerHtml;

  return (
    <div id="top" className="flex min-h-screen flex-col overflow-x-hidden" style={landingThemeStyle(config.theme, siteColors)}>
      <LandingHeader cfg={config.header} />
      <main className="flex-1">
        {children}
        <LandingFaq items={config.faq} lang={lang} />
      </main>
      <LandingFooter cfg={config.footer} safeTextHtml={footerText} />
      <LandingWidget cfg={config.widget} />
    </div>
  );
}
