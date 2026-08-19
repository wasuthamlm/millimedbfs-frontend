"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/data/nav";
import { cn } from "@/lib/utils";
import { NavDropdown } from "./NavDropdown";
import { MobileNav } from "./MobileNav";

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
  logoTextTh: string | null;
  menuWrap: string;
  menuFontSize: string;
};

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

const HEIGHT_PX: Record<string, number> = { compact: 56, standard: 72, tall: 88 };

export function Navbar({
  navLinks,
  config = DEFAULT_CONFIG,
  logoUrl,
  siteName,
}: {
  navLinks: NavLink[];
  config?: HeaderConfig;
  logoUrl?: string | null;
  siteName?: string | null;
}) {
  const pathname = usePathname();
  const heightPx = HEIGHT_PX[config.height] ?? HEIGHT_PX.standard;
  const shadowClass = config.shadow === "none" ? "" : config.shadow === "soft" ? "shadow-sm" : "shadow-md";
  const positionClass = config.position === "static" ? "relative" : "sticky top-0";
  const fontSizeClass =
    config.menuFontSize === "small" ? "text-xs" : config.menuFontSize === "large" ? "text-base" : "text-sm";

  const headerVars = {
    "--header-bg": config.bgColor,
    "--header-text": config.textColor,
    "--header-hover-bg": config.hoverBgColor,
    "--header-hover-text": config.hoverTextColor,
  } as CSSProperties;

  return (
    <header
      className={cn("z-40 border-b border-slate-100", positionClass, shadowClass)}
      style={{ ...headerVars, backgroundColor: config.bgColor, height: heightPx }}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {logoUrl ? (
            // Custom uploaded logo is a full wordmark (icon + "Millimed BFS" baked
            // in), so it replaces the icon+text pair below instead of sitting next
            // to it — otherwise the name would render twice. The source file has a
            // lot of empty margin above/below the mark, so it's cropped tighter by
            // scaling the image up inside an overflow-hidden box.
            <div className="relative h-14 w-36 overflow-hidden sm:h-16 sm:w-40">
              <Image
                src={logoUrl}
                alt={siteName || "Millimed BFS"}
                fill
                sizes="(min-width: 640px) 160px, 144px"
                className="scale-130 object-contain"
                unoptimized
              />
            </div>
          ) : (
            <>
              <Image src="/logo.svg" alt={siteName || "Millimed BFS"} width={36} height={36} />
              <span className="text-lg font-bold" style={{ color: config.iconTextColor }}>
                {config.logoTextTh || siteName || "Millimed BFS"}
              </span>
            </>
          )}
        </Link>

        <nav
          className={cn(
            "hidden min-w-0 flex-1 items-center gap-1 lg:flex",
            config.menuWrap === "wrap"
              ? "flex-wrap justify-end"
              : "overflow-x-auto [justify-content:safe_center] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            if (link.children) {
              return (
                <NavDropdown
                  key={link.href}
                  link={link}
                  active={active}
                  textColor={config.textColor}
                  activeBgColor={config.activeBgColor}
                  activeTextColor={config.activeTextColor}
                  fontSizeClass={fontSizeClass}
                />
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-medium transition-colors",
                  fontSizeClass,
                  !active && "hover:[background-color:var(--header-hover-bg)] hover:[color:var(--header-hover-text)]"
                )}
                style={
                  active
                    ? { backgroundColor: config.activeBgColor, color: config.activeTextColor }
                    : { color: config.textColor }
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <MobileNav navLinks={navLinks} iconColor={config.textColor} />
        </div>
      </div>
    </header>
  );
}
