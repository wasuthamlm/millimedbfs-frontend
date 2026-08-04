import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export type FooterColumnData = {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
};

export type FooterContactData = {
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export function Footer({
  columns,
  contact,
}: {
  columns: FooterColumnData[];
  contact: FooterContactData | null;
}) {
  return (
    <footer className="mt-auto bg-brand-navy-dark text-white/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Millimed BFS" width={32} height={32} />
            <span className="text-lg font-bold text-white">Millimed BFS</span>
          </div>
          {contact?.tagline && <p className="text-sm italic text-white/60">&ldquo;{contact.tagline}&rdquo;</p>}
          <p className="text-sm leading-relaxed">
            ผู้ผลิตและจำหน่ายผลิตภัณฑ์เวชภัณฑ์และการดูแลดวงตาชั้นนำของไทย
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.id}>
            <h3 className="mb-3 text-sm font-semibold text-white">{column.title}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {contact && (contact.phone || contact.email || contact.address) && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">ติดต่อเรา</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {contact.phone && <li>โทร: {contact.phone}</li>}
              {contact.email && <li>อีเมล: {contact.email}</li>}
              {contact.address && <li>{contact.address}</li>}
            </ul>
          </div>
        )}
      </Container>

      <div className="border-t border-white/10 py-5">
        <Container className="text-center text-xs text-white/50">
          © {new Date().getFullYear()} Millimed BFS. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
