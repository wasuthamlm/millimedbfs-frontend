import { Navbar } from "@/components/layout/Navbar";
import { PromoBar } from "@/components/layout/PromoBar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { SecretAdminAccess } from "@/components/layout/SecretAdminAccess";
import { Popup } from "@/components/layout/Popup";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SocialFloatButtons, type SocialFloatItem } from "@/components/layout/SocialFloatButtons";
import { prisma } from "@/lib/prisma";
import type { NavLink } from "@/data/nav";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [navRows, footerColumns, footerContact, widgets, popupConfig] = await Promise.all([
    prisma.navLink.findMany({
      where: { placement: "HEADER" },
      orderBy: { order: "asc" },
      include: { children: { orderBy: { order: "asc" } } },
    }),
    prisma.footerColumn.findMany({
      orderBy: { order: "asc" },
      include: { links: { orderBy: { order: "asc" } } },
    }),
    prisma.footerContact.findUnique({ where: { id: "singleton" } }),
    prisma.widget.findMany(),
    prisma.popupConfig.findUnique({ where: { id: "singleton" }, include: { image: true } }),
  ]);

  const navLinks: NavLink[] = navRows
    .filter((row) => !row.parentId)
    .map((row) => ({
      label: row.labelTh,
      href: row.href,
      children: row.children.length
        ? row.children.map((child) => ({ label: child.labelTh, href: child.href }))
        : undefined,
    }));

  const widgetByKey = new Map(widgets.map((w) => [w.key, w]));
  const scrollToTopEnabled = widgetByKey.get("scroll-to-top")?.enabled ?? false;
  const cookieConsentEnabled = widgetByKey.get("cookie-consent")?.enabled ?? false;

  const socialFloats: SocialFloatItem[] = (["line-official-account", "facebook-messenger"] as const)
    .map((key) => {
      const widget = widgetByKey.get(key);
      if (!widget?.enabled || !widget.link) return null;
      return { key, link: widget.link };
    })
    .filter((item): item is SocialFloatItem => item !== null);

  const popupData = popupConfig?.enabled
    ? {
        titleTh: popupConfig.titleTh ?? "",
        image: popupConfig.image?.url ?? "",
        link: popupConfig.link,
        frequency: popupConfig.frequency,
        startDate: popupConfig.startDate?.toISOString() ?? null,
        endDate: popupConfig.endDate?.toISOString() ?? null,
      }
    : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar navLinks={navLinks} />
      <PromoBar tagline={footerContact?.tagline ?? undefined} />
      <main className="flex-1">{children}</main>
      <Footer columns={footerColumns} contact={footerContact} />
      {scrollToTopEnabled && <ScrollToTopButton />}
      {cookieConsentEnabled && <CookieConsent />}
      <SocialFloatButtons items={socialFloats} />
      <Popup data={popupData?.image ? popupData : null} />
      <SecretAdminAccess />
    </div>
  );
}
