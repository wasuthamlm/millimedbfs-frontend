import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://millimedbfs.com"),
  title: {
    default: "Millimed BFS",
    template: "%s | Millimed BFS",
  },
  description:
    "Millimed BFS ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย ภายใต้แนวคิด Pass on Happiness",
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "Millimed BFS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${plexThai.variable} ${inter.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
