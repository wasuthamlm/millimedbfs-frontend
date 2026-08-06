import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon, LineIcon } from "@/components/ui/social-icons";

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
};

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
}: {
  columns: FooterColumnData[];
  contact: FooterContactData | null;
  theme?: FooterThemeData | null;
  social?: FooterSocialData | null;
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
  const copyright = theme?.copyrightTh || `© ${new Date().getFullYear()} Millimed BFS. All rights reserved.`;
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
      <Container className={`grid gap-10 py-14 sm:grid-cols-2 ${gridColsClass}`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Millimed BFS" width={32} height={32} />
            <span
              className={theme ? "text-lg font-bold" : "text-lg font-bold text-white"}
              style={theme ? { color: theme.textColor } : undefined}
            >
              Millimed BFS
            </span>
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
            ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย
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
              ติดต่อเรา
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {contact.phone && <li>โทร: {contact.phone}</li>}
              {contact.email && <li>อีเมล: {contact.email}</li>}
              {contact.address && <li>{contact.address}</li>}
            </ul>
          </div>
        )}
      </Container>

      <div
        className={theme ? "border-t py-5" : "border-t border-white/10 py-5"}
        style={theme ? { borderColor: theme.accentColor + "33" } : undefined}
      >
        <Container className={theme ? "text-center text-xs opacity-70" : "text-center text-xs text-white/50"}>
          {copyright}
        </Container>
      </div>
    </footer>
  );
}

function cnHeading(theme: FooterThemeData | null | undefined) {
  return theme ? "mb-3 text-sm font-semibold" : "mb-3 text-sm font-semibold text-white";
}
