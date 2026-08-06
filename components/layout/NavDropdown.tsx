"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "@/components/ui/icons";
import { dropdownVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/data/nav";

export function NavDropdown({
  link,
  active,
  textColor,
  activeBgColor,
  activeTextColor,
  fontSizeClass = "text-sm",
}: {
  link: NavLink;
  active: boolean;
  textColor?: string;
  activeBgColor?: string;
  activeTextColor?: string;
  fontSizeClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom, left: rect.left });
    setOpen(true);
  };

  // A parent whose href is empty/"#" has no page of its own — it exists only to host the
  // hover dropdown, so it must not navigate (e.g. "อาคารโรงงาน" pointing to children only).
  const clickable = !!link.href && link.href !== "#";
  const triggerClassName = cn(
    "flex items-center gap-1 rounded-full px-4 py-2 font-medium transition-colors",
    fontSizeClass,
    !active && "hover:[background-color:var(--header-hover-bg)] hover:[color:var(--header-hover-text)]",
    !clickable && "cursor-default"
  );
  const triggerStyle = active
    ? { backgroundColor: activeBgColor ?? "#16296b", color: activeTextColor ?? "#ffffff" }
    : { color: textColor };

  return (
    <div
      ref={triggerRef}
      className="relative shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={() => setOpen(false)}
    >
      {clickable ? (
        <Link href={link.href} className={triggerClassName} style={triggerStyle} onClick={() => setOpen(false)}>
          {link.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <button type="button" className={triggerClassName} style={triggerStyle} onClick={openMenu}>
          {link.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      <AnimatePresence>
        {open && link.children && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originY: 0, position: "fixed", top: pos.top, left: pos.left }}
            className="z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-lg"
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
