import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

// The app has two root layouts (public site + admin), so unmatched URLs have
// no single layout to render inside — this full-document page covers them.

export const metadata: Metadata = {
  title: "404 - ไม่พบหน้าที่คุณต้องการ",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="th" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">404</p>
          <h1 className="text-2xl font-bold text-slate-900">ไม่พบหน้าที่คุณต้องการ</h1>
          <p className="text-sm text-slate-500">หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </body>
    </html>
  );
}
