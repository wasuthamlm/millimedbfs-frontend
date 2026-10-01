"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/data/nav";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/i18n/ui";
import { localePath, splitLocale } from "@/lib/i18n/locales";
import { SearchIcon } from "@/components/ui/admin-icons";
import { NavDropdown, MenuLink, type ChildBehavior, type SubmenuStyle } from "./NavDropdown";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher, type SwitcherLanguage } from "./LanguageSwitcher";

export type HeaderConfig = {
  layout: string;
  height: string;
  shadow: string;
  position: string;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  activeBgColor: string;
  activeTextColor: string;
  iconTextColor: string;
  logoMode?: string;
  logoTextTh: string | null;
  logoTextEn?: string | null;
  menuWrap: string;
  menuFontSize: string;
  /** 0 = hide sub-menus, 1 = top level only, 2+ = show children */
  menuLevels?: number;
  submenuStyle?: string;
  submenuChildBehavior?: string;
  showSearch?: boolean;
  showLanguage?: boolean;
};

export type HeaderSocialLink = { href: string; label: string; icon: React.ReactNode };

const DEFAULT_CONFIG: HeaderConfig = {
  layout: "logo-left-menu-center",
  height: "standard",
  shadow: "none",
  position: "fixed-top",
  bgColor: "#ffffff",
  textColor: "#334155",
  hoverBgColor: "#f1f5f9",
  hoverTextColor: "#16296b",
  activeBgColor: "#16296b",
  activeTextColor: "#ffffff",
  iconTextColor: "#16296b",
  logoTextTh: null,
  menuWrap: "single-line",
  menuFontSize: "normal",
};

const HEIGHT_PX: Record<string, number> = { compact: 56, standard: 72, tall: 88, large: 88 };
const FONT: Record<string, string> = { small: "text-xs", normal: "text-sm", large: "text-base", xlarge: "text-lg" };

export function Navbar({
  navLinks,
  config = DEFAULT_CONFIG,
  logoUrl,
  siteName,
  languages = [],
  socialLinks = [],
}: {
  navLinks: NavLink[];
  config?: HeaderConfig;
  logoUrl?: string | null;
  siteName?: string | null;
  languages?: SwitcherLanguage[];
  socialLinks?: HeaderSocialLink[];
}) {
  const pathname = usePathname() || "/";
  const { locale, path: currentPath } = splitLocale(pathname);
  const heightPx = HEIGHT_PX[config.height] ?? HEIGHT_PX.standard;
  const shadowClass = config.shadow === "none" ? "" : config.shadow === "soft" ? "shadow-sm" : "shadow-md";
  const fontSizeClass = FONT[config.menuFontSize] ?? FONT.normal;
  const levels = config.menuLevels ?? 2;
  const layout = config.layout;
  const stacked = layout === "logo-center-menu-below" || layout === "centered-stack";
  // "fixed-top" and "sticky" both pin the header while scrolling; sticky keeps it
  // in the document flow, so no spacer height has to be guessed.
  const pinned = config.position !== "static";

  // Menu hrefs are stored locale-less; prefix them for the current language.
  const localize = (links: NavLink[], depth = 1): NavLink[] =>
    links.map((l) => ({
      ...l,
      href: l.href && l.href.startsWith("/") ? localePath(locale, l.href) : l.href,
      children: levels >= depth + 1 && l.children?.length ? localize(l.children, depth + 1) : undefined,
    }));
  const links = localize(navLinks);

  // Only real in-site paths can match. Parent items without a page of their own
  // (href "" or "#") are active when one of their children is.
  const here = localePath(locale, currentPath);
  const home = localePath(locale, "/");
  const isActive = (link: NavLink): boolean => {
    const href = link.href;
    if (href && href.startsWith("/")) {
      if (pathname === href || here === href) return true;
      if (href !== home && here.startsWith(href + "/")) return true;
    }
    return !!link.children?.some(isActive);
  };

  const headerVars = {
    "--header-bg": config.bgColor,
    "--header-text": config.textColor,
    "--header-hover-bg": config.hoverBgColor,
    "--header-hover-text": config.hoverTextColor,
  } as CSSProperties;

  const logoText = (locale === "en" && config.logoTextEn) || config.logoTextTh || siteName || "Millimed BFS";
  const logo = (
    <Link href={localePath(locale, "/")} className="flex shrink-0 items-center gap-2">
      {logoUrl && config.logoMode !== "text-only" ? (
        // The uploaded logo is a full wordmark, so it replaces the icon + text pair.
        <div className={cn("relative overflow-hidden", layout === "compact-actions-right" ? "h-10 w-28" : "h-14 w-36 sm:h-16 sm:w-40")}>
          <Image src={logoUrl} alt={siteName || "Millimed BFS"} fill sizes="160px" className="scale-130 object-contain" unoptimized />
        </div>
      ) : (
        <>
          {config.logoMode !== "text-only" && <Image src="/logo.svg" alt="" width={36} height={36} />}
          <span className="text-lg font-bold" style={{ color: config.iconTextColor }}>
            {logoText}
          </span>
        </>
      )}
    </Link>
  );

  const menu = (
    <nav
      aria-label={ui(locale, "mainMenu")}
      className={cn(
        "hidden min-w-0 items-center gap-1 lg:flex",
        stacked ? "w-full justify-center" : "flex-1",
        layout === "logo-left-menu-right" || layout === "compact-actions-right" ? "justify-end" : "",
        config.menuWrap === "wrap"
          ? "flex-wrap"
          : "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " + (layout === "logo-left-menu-center" || stacked ? "[justify-content:safe_center]" : ""),
      )}
    >
      {links.map((link) => {
        const active = isActive(link);
        const key = link.id ?? link.href ?? link.label;
        if (link.children?.length) {
          return (
            <NavDropdown
              key={key}
              link={link}
              active={active}
              textColor={config.textColor}
              activeBgColor={config.activeBgColor}
              activeTextColor={config.activeTextColor}
              fontSizeClass={fontSizeClass}
              style={(config.submenuStyle as SubmenuStyle) ?? "hover-open"}
              childBehavior={(config.submenuChildBehavior as ChildBehavior) ?? "below-parent"}
            />
          );
        }
        return (
          <MenuLink
            key={key}
            link={link}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-medium transition-colors",
              fontSizeClass,
              !active && "hover:[background-color:var(--header-hover-bg)] hover:[color:var(--header-hover-text)]",
            )}
            style={active ? { backgroundColor: config.activeBgColor, color: config.activeTextColor } : { color: config.textColor }}
          />
        );
      })}
    </nav>
  );

  const actions = (
    <div className="flex shrink-0 items-center gap-1">
      {socialLinks.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="hidden rounded-full p-2 opacity-80 hover:opacity-100 md:inline-flex" style={{ color: config.textColor }}>
          {s.icon}
        </a>
      ))}
      {config.showSearch && (
        <Link href={localePath(locale, "/search")} aria-label={ui(locale, "search")} className="rounded-full p-2 hover:bg-black/5" style={{ color: config.textColor }}>
          <SearchIcon className="h-5 w-5" />
        </Link>
      )}
      {config.showLanguage !== false && (
        <div className="hidden lg:block">
          <LanguageSwitcher languages={languages} color={config.textColor} />
        </div>
      )}
      <MobileNav navLinks={links} iconColor={config.textColor} languages={config.showLanguage !== false ? languages : []} />
    </div>
  );

  return (
    <>
      <header
        className={cn("z-40 w-full border-b border-slate-100", pinned ? "sticky top-0" : "relative", shadowClass)}
        style={{ ...headerVars, backgroundColor: config.bgColor, ...(stacked ? {} : { height: heightPx }) }}
      >
        {stacked ? (
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex w-full items-center justify-between lg:justify-center" style={{ minHeight: heightPx - 16 }}>
              {logo}
              <div className="lg:absolute lg:right-8">{actions}</div>
            </div>
            {menu}
          </div>
        ) : layout === "menu-left-logo-center" ? (
          <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0">{menu}</div>
            {logo}
            <div className="flex justify-end">{actions}</div>
          </div>
        ) : (
          <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {logo}
            {menu}
            {actions}
          </div>
        )}
      </header>
    </>
  );
}
