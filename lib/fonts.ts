import { IBM_Plex_Sans_Thai, Inter, Prompt, Sarabun } from "next/font/google";

// Shared by the two root layouts (public site and admin) and global-not-found.

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
// site's header/body font at runtime via CSS variables — see lib/theme.ts.
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

export const fontVariables = `${plexThai.variable} ${inter.variable} ${prompt.variable} ${sarabun.variable}`;
