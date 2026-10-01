import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon, LineIcon } from "@/components/ui/social-icons";
import { CookieSettingsLink } from "@/components/layout/CookieSettingsLink";
import { hasFooterBlocks, type FooterBlock, type FooterBlocksConfig } from "@/lib/footer-blocks";
import type { PolicyLink } from "@/lib/i18n/cookie-strings";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/i18n/ui";

export type FooterSocialData = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  lineUrl: string | null;
};

export type FooterColumnData = {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
};

export type FooterContactData = {
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  addressEn?: string | null;
};

/** Policy link label: EN column for English, the shared dictionary for known policy pages in other languages, else Thai. */
function policyLabel(l: PolicyLink, lang: string): string {
  if (lang === "en" && l.labelEn) return l.labelEn;
  if (lang !== "th" && lang !== "en") {
    if (l.url === "/privacy-policy") return ui(lang, "privacyPolicy");
    if (l.url === "/cookie-policy") return ui(lang, "cookiePolicy");
  }
  return l.labelTh;
}

export type FooterThemeData = {
  bgColor: string;
  textColor: string;
  accentColor: string;
  desktopColumns: number;
  copyrightTh: string | null;
  copyrightEn: string | null;
};

export function Footer({
  columns,
  contact,
  theme,
  social,
  logoUrl,
  blocks,
  policyLinks,
  lang = "th",
}: {
  columns: FooterColumnData[];
  contact: FooterContactData | null;
  theme?: FooterThemeData | null;
  social?: FooterSocialData | null;
  logoUrl?: string | null;
  /** Block layout from Admin → Footer; when empty the column layout below is used. */
  blocks?: FooterBlocksConfig | null;
  /** From Admin → Cookie Consent → ลิงก์นโยบาย */
  policyLinks?: PolicyLink[];
  lang?: string;
}) {
  const socialLinks = social
    ? [
        { href: social.facebookUrl, Icon: FacebookIcon, label: "Facebook" },
        { href: social.instagramUrl, Icon: InstagramIcon, label: "Instagram" },
        { href: social.youtubeUrl, Icon: YoutubeIcon, label: "YouTube" },
        { href: social.tiktokUrl, Icon: TikTokIcon, label: "TikTok" },
        { href: social.lineUrl, Icon: LineIcon, label: "LINE" },
      ].filter((item): item is { href: string; Icon: typeof FacebookIcon; label: string } => !!item.href)
    : [];
  const copyright =
    (lang === "en" && theme?.copyrightEn) || theme?.copyrightTh || `© ${new Date().getFullYear()} Millimed BFS. All rights reserved.`;
  const linkClass = theme
    ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
    : "transition-colors hover:text-white";
  const useBlocks = hasFooterBlocks(blocks);
  const gridColsClass =
    theme?.desktopColumns === 1
      ? "lg:grid-cols-2"
      : theme?.desktopColumns === 2
        ? "lg:grid-cols-3"
        : theme?.desktopColumns === 4
          ? "lg:grid-cols-5"
          : "lg:grid-cols-4";

  return (
    <footer
      className={theme ? "mt-auto" : "mt-auto bg-brand-navy-dark text-white/80"}
      style={
        theme
          ? ({
              backgroundColor: theme.bgColor,
              color: theme.textColor,
              "--footer-link": theme.textColor,
              "--footer-link-hover": theme.accentColor,
            } as CSSProperties)
          : undefined
      }
    >
      {useBlocks ? (
        <FooterBlockColumns
          config={blocks!}
          contact={contact}
          socialLinks={socialLinks}
          logoUrl={logoUrl}
          lang={lang}
          headingStyle={theme ? { color: theme.textColor } : undefined}
          linkClass={linkClass}
        />
      ) : (
      <Container className={`grid gap-10 py-14 sm:grid-cols-2 ${gridColsClass}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // The uploaded logo is a wordmark on an opaque white background
              // (no transparency), so it needs its own white pill to sit
              // cleanly on the dark footer instead of showing a stray white
              // box — otherwise it replaces the icon+text pair below.
              <div className="w-fit rounded-md bg-white px-2 py-1">
                <Image src={logoUrl} alt="Millimed BFS" width={160} height={80} unoptimized className="h-8 w-auto" />
              </div>
            ) : (
              <>
                <Image src="/logo.svg" alt="Millimed BFS" width={32} height={32} />
                <span
                  className={theme ? "text-lg font-bold" : "text-lg font-bold text-white"}
                  style={theme ? { color: theme.textColor } : undefined}
                >
                  Millimed BFS
                </span>
              </>
            )}
          </div>
          {contact?.tagline && (
            <p
              className={theme ? "text-sm italic opacity-70" : "text-sm italic text-white/60"}
              style={theme ? { color: theme.textColor } : undefined}
            >
              &ldquo;{contact.tagline}&rdquo;
            </p>
          )}
          <p className="text-sm leading-relaxed">
            {ui(lang, "footerTagline")}
          </p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={
                    theme
                      ? "opacity-70 transition-opacity hover:opacity-100"
                      : "text-white/60 transition-colors hover:text-white"
                  }
                  style={theme ? { color: theme.textColor } : undefined}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.slice(0, theme?.desktopColumns ?? columns.length).map((column) => (
          <div key={column.id}>
            <h3
              className={cnHeading(theme)}
              style={theme ? { color: theme.textColor } : undefined}
            >
              {column.title}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={
                      theme
                        ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
                        : "transition-colors hover:text-white"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {contact && (contact.phone || contact.email || contact.address) && (
          <div>
            <h3 className={cnHeading(theme)} style={theme ? { color: theme.textColor } : undefined}>
              {ui(lang, "contactUs")}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {contact.phone && (
                <li>
                  {ui(lang, "call")}: {contact.phone}
                </li>
              )}
              {contact.email && (
                <li>
                  {ui(lang, "email")}: {contact.email}
                </li>
              )}
              {contact.address && <li>{(lang === "en" && contact.addressEn) || contact.address}</li>}
            </ul>
          </div>
        )}
      </Container>
      )}

      <div
        className={theme ? "border-t py-5" : "border-t border-white/10 py-5"}
        style={theme ? { borderColor: theme.accentColor + "33" } : undefined}
      >
        <Container
          className={
            theme
              ? "flex flex-col items-center gap-2 text-center text-xs opacity-70 sm:flex-row sm:justify-between"
              : "flex flex-col items-center gap-2 text-center text-xs text-white/50 sm:flex-row sm:justify-between"
          }
        >
          <span>{copyright}</span>
          <div className="flex items-center gap-4">
            {(policyLinks ?? [
              { labelTh: "นโยบายความเป็นส่วนตัว", labelEn: "Privacy Policy", url: "/privacy-policy" },
              { labelTh: "นโยบายการใช้คุกกี้", labelEn: "Cookie Policy", url: "/cookie-policy" },
            ])
              .filter((l) => l.url && l.url !== "#")
              .map((l) => (
                <Link key={l.url} href={l.url} className={linkClass}>
                  {policyLabel(l, lang)}
                </Link>
              ))}
            <CookieSettingsLink
              className={
                theme
                  ? "transition-colors [color:var(--footer-link)] hover:[color:var(--footer-link-hover)]"
                  : "transition-colors hover:text-white"
              }
            />
          </div>
        </Container>
      </div>
    </footer>
  );
}

function cnHeading(theme: FooterThemeData | null | undefined) {
  return theme ? "mb-3 text-sm font-semibold" : "mb-3 text-sm font-semibold text-white";
}

const ALIGN: Record<string, string> = { left: "text-left items-start", center: "text-center items-center", right: "text-right items-end" };
const ICON_SIZE: Record<string, string> = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" };
const COLS: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

type SocialLink = { href: string; Icon: typeof FacebookIcon; label: string };

/** Block layout (legacy footer_config columns/blocks). */
function FooterBlockColumns({
  config,
  contact,
  socialLinks,
  logoUrl,
  lang,
  headingStyle,
  linkClass,
}: {
  config: FooterBlocksConfig;
  contact: FooterContactData | null;
  socialLinks: SocialLink[];
  logoUrl?: string | null;
  lang: string;
  headingStyle?: CSSProperties;
  linkClass: string;
}) {
  const columns = config.columns.filter((c) => c.blocks.some((b) => b.visible));
  const t = (th: string, en: string) => (lang === "en" && en) || th;
  const socialRow = (size: string, align: string) =>
    socialLinks.length > 0 && (
      <div className={cn("flex flex-wrap gap-3", align === "center" && "justify-center", align === "right" && "justify-end")}>
        {socialLinks.map(({ href, Icon, label }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} {...(label === "LINE" ? { "data-line-click": "footer" } : {})} className="opacity-70 transition-opacity hover:opacity-100">
            <Icon className={ICON_SIZE[size] ?? ICON_SIZE.md} />
          </a>
        ))}
      </div>
    );

  const renderBlock = (block: FooterBlock) => {
    const title = t(block.titleTh, block.titleEn);
    const heading = title ? (
      <h3 className="mb-3 text-sm font-semibold" style={headingStyle}>
        {title}
      </h3>
    ) : null;
    switch (block.type) {
      case "logo_text": {
        const src = block.logoUrl || logoUrl;
        return (
          <>
            {src ? (
              <div className="w-fit rounded-md bg-white px-2 py-1">
                <Image src={src} alt="Millimed BFS" width={200} height={80} unoptimized className="h-10 w-auto" />
              </div>
            ) : (
              <Image src="/logo.svg" alt="Millimed BFS" width={40} height={40} />
            )}
            {t(block.textTh, block.textEn) && <p className="whitespace-pre-line text-sm leading-relaxed">{t(block.textTh, block.textEn)}</p>}
          </>
        );
      }
      case "links":
        return (
          <>
            {heading}
            <ul className="flex flex-col gap-2 text-sm">
              {block.items.filter((i) => i.url).map((i, idx) => (
                <li key={idx}>
                  <Link href={i.url} className={linkClass}>
                    {t(i.labelTh, i.labelEn)}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        );
      case "contact":
        return (
          <>
            {heading}
            <ul className="flex flex-col gap-2 text-sm">
              {contact?.address && <li className="whitespace-pre-line">{contact.address}</li>}
              {contact?.phone && (
                <li>
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                    {ui(lang, "call")}: {contact.phone}
                  </a>
                </li>
              )}
              {contact?.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className={linkClass}>
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
            {block.showSocial && <div className="mt-3">{socialRow("md", block.alignment)}</div>}
          </>
        );
      case "social":
        return (
          <>
            {heading}
            {socialRow(block.iconSize, block.alignment)}
          </>
        );
      case "custom_text":
        return (
          <>
            {heading}
            <p className="whitespace-pre-line text-sm leading-relaxed">{t(block.textTh, block.textEn)}</p>
          </>
        );
    }
  };

  return (
    <Container className={cn("grid gap-10 py-14 sm:grid-cols-2", COLS[columns.length] ?? "lg:grid-cols-3")}>
      {columns.map((col) => (
        <div key={col.id} className="flex flex-col gap-8">
          {col.blocks
            .filter((b) => b.visible)
            .map((block) => (
              <div key={block.id} className={cn("flex flex-col gap-3", ALIGN[block.alignment] ?? ALIGN.left)}>
                {renderBlock(block)}
              </div>
            ))}
        </div>
      ))}
    </Container>
  );
}
