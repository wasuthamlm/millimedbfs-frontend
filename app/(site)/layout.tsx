import type { Metadata } from "next";
import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { PromoBar } from "@/components/layout/PromoBar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { SecretAdminAccess } from "@/components/layout/SecretAdminAccess";
import { Popup } from "@/components/layout/Popup";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { SocialFloatButtons, type SocialFloatItem } from "@/components/layout/SocialFloatButtons";
import { prisma } from "@/lib/prisma";
import { globalThemeStyle } from "@/lib/theme";
import type { NavLink } from "@/data/nav";

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, include: { favicon: true } });
  return siteSettings?.favicon?.url ? { icons: { icon: siteSettings.favicon.url } } : {};
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [navRows, footerColumns, footerContact, widgets, popupConfig, headerConfig, footerConfig, siteSettings, globalTheme] =
    await Promise.all([
      prisma.navLink.findMany({
        where: { placement: "HEADER", active: true },
        orderBy: { order: "asc" },
        include: { children: { where: { active: true }, orderBy: { order: "asc" } } },
      }),
      prisma.footerColumn.findMany({
        orderBy: { order: "asc" },
        include: { links: { orderBy: { order: "asc" } } },
      }),
      prisma.footerContact.findUnique({ where: { id: "singleton" } }),
      prisma.widget.findMany(),
      prisma.popupConfig.findUnique({ where: { id: "singleton" }, include: { image: true } }),
      prisma.siteHeaderConfig.findUnique({ where: { id: "singleton" } }),
      prisma.footerConfig.findUnique({ where: { id: "singleton" } }),
      prisma.siteSettings.findUnique({ where: { id: "singleton" }, include: { siteLogo: true } }),
      prisma.globalTheme.findUnique({ where: { id: "singleton" } }),
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
    <div className="flex min-h-full flex-1 flex-col" style={globalTheme ? globalThemeStyle(globalTheme) : undefined}>
      {siteSettings?.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${siteSettings.gtmId}');`}
        </Script>
      )}
      {siteSettings?.ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${siteSettings.ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${siteSettings.ga4Id}');`}
          </Script>
        </>
      )}
      {siteSettings?.fbPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${siteSettings.fbPixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {siteSettings?.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${siteSettings.tiktokPixelId}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}
      <Navbar
        navLinks={navLinks}
        logoUrl={siteSettings?.siteLogo?.url}
        siteName={siteSettings?.siteNameTh}
        config={
          headerConfig
            ? {
                layout: headerConfig.layout,
                height: headerConfig.height,
                shadow: headerConfig.shadow,
                position: headerConfig.position,
                bgColor: headerConfig.bgColor,
                textColor: headerConfig.textColor,
                hoverBgColor: headerConfig.hoverBgColor,
                hoverTextColor: headerConfig.hoverTextColor,
                activeBgColor: headerConfig.activeBgColor,
                activeTextColor: headerConfig.activeTextColor,
                iconTextColor: headerConfig.iconTextColor,
                logoTextTh: headerConfig.logoTextTh,
                menuWrap: headerConfig.menuWrap,
                menuFontSize: headerConfig.menuFontSize,
              }
            : undefined
        }
      />
      <PromoBar tagline={footerContact?.tagline ?? undefined} />
      <main className="flex-1">{children}</main>
      <Footer
        columns={footerColumns}
        contact={footerContact}
        theme={footerConfig}
        social={
          siteSettings
            ? {
                facebookUrl: siteSettings.facebookUrl,
                instagramUrl: siteSettings.instagramUrl,
                youtubeUrl: siteSettings.youtubeUrl,
                tiktokUrl: siteSettings.tiktokUrl,
                lineUrl: siteSettings.lineUrl,
              }
            : null
        }
      />
      {scrollToTopEnabled && <ScrollToTopButton />}
      {cookieConsentEnabled && <CookieConsent />}
      <SocialFloatButtons items={socialFloats} />
      <Popup data={popupData?.image ? popupData : null} />
      <SecretAdminAccess />
    </div>
  );
}
