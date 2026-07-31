"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "@/components/ui/icons";
import { dropdownVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/data/nav";

export function NavDropdown({ link, active }: { link: NavLink; active: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={link.href}
        className={cn(
          "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-brand-navy text-white"
            : "text-slate-700 hover:bg-slate-100 hover:text-brand-navy"
        )}
        onClick={() => setOpen(false)}
      >
        {link.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </Link>
      <AnimatePresence>
        {open && link.children && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originY: 0 }}
            className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-lg"
          >
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-navy"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
