"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown } from "@/components/ui/icons";
import type { NavLink } from "@/data/nav";
import { cn } from "@/lib/utils";

export function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="เปิดเมนู"
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
      >
        <Menu className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold text-brand-navy">เมนู</span>
                <button
                  type="button"
                  aria-label="ปิดเมนู"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  if (!link.children) {
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm font-medium",
                          active
                            ? "bg-brand-navy text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  }
                  const isExpanded = expanded === link.href;
                  return (
                    <div key={link.href}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(isExpanded ? null : link.href)
                        }
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
