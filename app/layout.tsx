import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter, Prompt, Sarabun } from "next/font/google";
import { buildOpenGraph, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-thai-fallback",
  display: "swap",
});

// Loaded alongside the defaults above so Global Settings (admin) can switch the public
// site's header/body font at runtime via CSS variables — see app/(site)/layout.tsx.
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Millimed BFS ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย ภายใต้แนวคิด Pass on Happiness",
  openGraph: buildOpenGraph({}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${plexThai.variable} ${inter.variable} ${prompt.variable} ${sarabun.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
