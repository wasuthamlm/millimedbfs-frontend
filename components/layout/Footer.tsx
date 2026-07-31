import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/data/nav";

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-navy-dark text-white/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Millimed BFS" width={32} height={32} />
            <span className="text-lg font-bold text-white">Millimed BFS</span>
          </div>
          <p className="text-sm italic text-white/60">&ldquo;Pass on Happiness&rdquo;</p>
          <p className="text-sm leading-relaxed">
            ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">เมนูลัด</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">ติดต่อเรา</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>โทร: 02-XXX-XXXX</li>
            <li>อีเมล: info@millimedbfs.com</li>
            <li>กรุงเทพมหานคร ประเทศไทย</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">บัญชี</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/register" className="transition-colors hover:text-white">
                สมัครสมาชิก
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-white">
                เข้าสู่ระบบ
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-5">
        <Container className="text-center text-xs text-white/50">
          © {new Date().getFullYear()} Millimed BFS. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
