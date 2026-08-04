import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบผู้ดูแล",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex items-center gap-2">
        <Image src="/logo.svg" alt="Millimed BFS" width={40} height={40} />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-brand-navy">มิลลิเมด บีเอฟเอส</span>
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
