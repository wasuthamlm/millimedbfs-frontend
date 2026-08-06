"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { adminNavItems } from "@/data/admin-nav";
import { PanelLeftIcon, LogOutIcon, GlobeIcon } from "@/components/ui/admin-icons";
import { ChevronDown, Menu, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

function isChildActive(pathname: string | null, href: string) {
  return pathname === href || !!pathname?.startsWith(href + "/");
}

function findActiveParent(pathname: string | null) {
  return adminNavItems.find((item) =>
    item.children?.some((child) => isChildActive(pathname, child.href))
  )?.href;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(() => findActiveParent(pathname) ?? null);

  // Re-sync which submenu is open whenever the active route's section changes,
  // so navigating into a different section auto-expands it (single accordion),
  // and close the mobile drawer so it doesn't stay open after navigating.
  useEffect(() => {
    setOpenMenu(findActiveParent(pathname) ?? null);
    setMobileOpen(false);
  }, [pathname]);

  const toggleMenu = (href: string) => {
    setOpenMenu((prev) => (prev === href ? null : href));
  };

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden bg-brand-navy text-white/90 transition-transform duration-200 ease-out lg:z-30 lg:translate-x-0 lg:transition-[width] lg:will-change-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <Image src="/logo.svg" alt="Millimed BFS" width={32} height={32} className="shrink-0" />
            {!collapsed && (
              <span className="flex flex-col leading-tight">
                <span className="whitespace-nowrap text-sm font-bold text-white">
                  มิลลิเมด บีเอฟเอส
                </span>
                <span className="text-xs text-white/60">Admin Control</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="ย่อ/ขยายเมนู"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden shrink-0 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:block"
          >
            <PanelLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setMobileOpen(false)}
            className="shrink-0 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = !!item.children?.length;

              if (!hasChildren) {
                const active = isChildActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                        active ? "bg-white text-brand-navy" : "text-white/80 hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              }

              const childActive = item.children!.some((c) => isChildActive(pathname, c.href));
              const isOpen = openMenu === item.href;

              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                      childActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200 ease-out",
                            isOpen && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && (
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="ml-4 mt-1 flex flex-col gap-1 overflow-hidden border-l border-white/10 pl-4"
                        >
                          {item.children!.map((child) => {
                            const active = pathname === child.href;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "block rounded-md px-3 py-2 text-sm transition-colors duration-150",
                                    active
                                      ? "bg-white font-semibold text-brand-navy"
                                      : "text-white/70 hover:bg-white/10 hover:text-white"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/10 px-3 py-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            <GlobeIcon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>ไปที่เว็บไซต์หลัก</span>}
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10"
          >
            <LogOutIcon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-200 ease-out",
          collapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="เปิดเมนู"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-semibold text-brand-navy">มิลลิเมด บีเอฟเอส Admin</span>
        </div>
        <div className="px-6 py-6 sm:px-10 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
