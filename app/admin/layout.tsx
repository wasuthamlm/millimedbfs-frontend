import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Admin Control",
    template: "%s | Admin Control",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts has already confirmed this role against the database.
  const session = await auth();
  return <AdminShell role={session?.user?.role ?? null}>{children}</AdminShell>;
}
