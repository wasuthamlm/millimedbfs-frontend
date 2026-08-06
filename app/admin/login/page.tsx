import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบผู้ดูแล",
  robots: { index: false, follow: false },
};

// Reads SiteSettings (logo/login background) — must not be prerendered as static,
// or a changed asset in Settings won't show until the next full rebuild.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { siteLogo: true, loginBg: true },
  });

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-cover bg-center px-4"
      style={siteSettings?.loginBg?.url ? { backgroundImage: `url(${siteSettings.loginBg.url})` } : undefined}
    >
      <div
        className={
          siteSettings?.loginBg?.url
            ? "flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 backdrop-blur-sm"
            : "flex items-center gap-2"
        }
      >
        <Image
          src={siteSettings?.siteLogo?.url || "/logo.svg"}
          alt={siteSettings?.siteNameTh || "Millimed BFS"}
          width={40}
          height={40}
          unoptimized={!!siteSettings?.siteLogo?.url}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-brand-navy">{siteSettings?.siteNameTh || "มิลลิเมด บีเอฟเอส"}</span>
          <span className="text-xs text-slate-400">Admin Control</span>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-lg font-semibold text-slate-800">
          เข้าสู่ระบบผู้ดูแลเว็บไซต์
        </h1>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
