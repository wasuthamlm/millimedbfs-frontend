import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminRole } from "@/lib/require-admin";
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
  // Read from the database, not the JWT, so the sidebar follows role changes immediately.
  const role = await getAdminRole();
  return (
    <html lang="th" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <AdminShell role={role}>{children}</AdminShell>
      </body>
    </html>
  );
}
