import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function SiteNotFound() {
  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">404</p>
      <h1 className="text-2xl font-bold text-slate-900">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="text-sm text-slate-500">หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
      >
        กลับหน้าแรก
      </Link>
    </Container>
  );
}
