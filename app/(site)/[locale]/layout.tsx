import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildOpenGraph, buildTwitter, SITE_NAME, SITE_URL } from "@/lib/site";
import { fontVariables } from "@/lib/fonts";
import { isLocaleCode, localeInfo } from "@/lib/i18n/locales";
import { getEnabledLocales } from "@/lib/i18n/enabled-locales";
import "../../globals.css";

// Root layout for the public site. The admin panel has its own root layout
// (app/admin/layout.tsx) — two roots so <html lang> can follow the locale.

// Prerender the enabled locales so pages that don't opt into force-dynamic stay
// static (as they were before the [locale] segment). Locales enabled later
// render on demand.
export async function generateStaticParams() {
  return (await getEnabledLocales()).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Millimed BFS ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย ภายใต้แนวคิด Pass on Happiness",
    openGraph: { ...buildOpenGraph({}), locale: localeInfo(locale).ogLocale },
    twitter: buildTwitter(),
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      ...(process.env.BING_SITE_VERIFICATION
        ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
        : {}),
    },
  };
}

export default async function LocaleRootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  // proxy.ts already redirects disabled locales; this guards direct hits on
  // the internal /th/... form and anything that slips past the matcher.
  if (!isLocaleCode(locale) || !(await getEnabledLocales()).includes(locale)) notFound();

  return (
    <html lang={locale} className={`${fontVariables} antialiased`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
