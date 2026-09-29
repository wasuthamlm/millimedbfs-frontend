import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { fontVariables } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

// Root layout for the admin panel (the public site's root is app/(site)/[locale]/layout.tsx).

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Admin Control",
    template: "%s | Admin Control",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts has already confirmed this role against the database.
  const session = await auth();
  return (
    <html lang="th" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <AdminShell role={session?.user?.role ?? null}>{children}</AdminShell>
      </body>
    </html>
  );
}
