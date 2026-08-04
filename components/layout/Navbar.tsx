"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/data/nav";
import { cn } from "@/lib/utils";
import { NavDropdown } from "./NavDropdown";
import { MobileNav } from "./MobileNav";

export function Navbar({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Millimed BFS" width={36} height={36} />
          <span className="text-lg font-bold text-brand-navy">Millimed BFS</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            if (link.children) {
              return <NavDropdown key={link.href} link={link} active={active} />;
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-navy text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-brand-navy"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <MobileNav navLinks={navLinks} />
        </div>
      </div>
    </header>
  );
}
