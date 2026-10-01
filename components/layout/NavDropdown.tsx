"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "@/components/ui/icons";
import { dropdownVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/data/nav";

export type SubmenuStyle = "click-open" | "hover-open" | "mega";
export type ChildBehavior = "below-parent" | "open-right" | "full-vertical";

/** A menu link that honours "open in new tab" and never navigates when it has no page of its own. */
export function MenuLink({ link, className, style, onClick, children }: { link: NavLink; className?: string; style?: React.CSSProperties; onClick?: () => void; children?: React.ReactNode }) {
  const body = children ?? link.label;
  if (!link.href || link.href === "#") return <span className={cn(className, "cursor-default")} style={style}>{body}</span>;
  if (link.newTab || /^https?:\/\//.test(link.href)) {
    return (
      <a href={link.href} className={className} style={style} onClick={onClick} {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {body}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} style={style} onClick={onClick}>
      {body}
    </Link>
  );
}

const itemClass = "block px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-navy";

function ChildList({ items, behavior, close }: { items: NavLink[]; behavior: ChildBehavior; close: () => void }) {
  return (
    <>
      {items.map((child) => (
        <div key={child.id ?? child.href ?? child.label} className={cn(behavior === "open-right" && !!child.children?.length && "group/child relative")}>
          <MenuLink link={child} className={cn(itemClass, !!child.children?.length && "font-medium text-slate-800")} onClick={close} />
          {child.children?.length ? (
            behavior === "open-right" ? (
              <div className="invisible absolute left-full top-0 w-52 rounded-xl border border-slate-100 bg-white py-2 opacity-0 shadow-lg transition-opacity group-hover/child:visible group-hover/child:opacity-100">
                {child.children.map((g) => (
                  <MenuLink key={g.id ?? g.href ?? g.label} link={g} className={itemClass} onClick={close} />
                ))}
              </div>
            ) : (
              <div className={cn(behavior === "below-parent" ? "pl-4" : "")}>
                {child.children.map((g) => (
                  <MenuLink key={g.id ?? g.href ?? g.label} link={g} className={cn(itemClass, behavior === "below-parent" && "py-1.5 text-xs")} onClick={close} />
                ))}
              </div>
            )
          ) : null}
        </div>
      ))}
    </>
  );
}

export function NavDropdown({
  link,
  active,
  textColor,
  activeBgColor,
  activeTextColor,
  fontSizeClass = "text-sm",
  style = "hover-open",
  childBehavior = "below-parent",
}: {
  link: NavLink;
  active: boolean;
  textColor?: string;
  activeBgColor?: string;
  activeTextColor?: string;
  fontSizeClass?: string;
  style?: SubmenuStyle;
  childBehavior?: ChildBehavior;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hover = style !== "click-open";

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom, left: style === "mega" ? 0 : rect.left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open || hover) return;
    const onDown = (e: MouseEvent) => !triggerRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, hover]);

  const triggerClassName = cn(
    "flex items-center gap-1 rounded-full px-4 py-2 font-medium transition-colors",
    fontSizeClass,
    !active && "hover:[background-color:var(--header-hover-bg)] hover:[color:var(--header-hover-text)]",
  );
  const triggerStyle = active ? { backgroundColor: activeBgColor ?? "#16296b", color: activeTextColor ?? "#ffffff" } : { color: textColor };
  const chevron = <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />;
  const close = () => setOpen(false);

  return (
    <div
      ref={triggerRef}
      className="relative shrink-0"
      onMouseEnter={hover ? openMenu : undefined}
      onMouseLeave={hover ? close : undefined}
    >
      {hover ? (
        <MenuLink link={link} className={triggerClassName} style={triggerStyle} onClick={close}>
          {link.label}
          {chevron}
        </MenuLink>
      ) : (
        <button type="button" aria-expanded={open} className={triggerClassName} style={triggerStyle} onClick={() => (open ? close() : openMenu())}>
          {link.label}
          {chevron}
        </button>
      )}
      <AnimatePresence>
        {open && link.children && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ originY: 0, position: "fixed", top: pos.top, left: pos.left, ...(style === "mega" ? { right: 0 } : {}) }}
            className={cn(
              "z-50 mt-1 overflow-visible border border-slate-100 bg-white shadow-lg",
              style === "mega" ? "mx-auto max-w-6xl rounded-b-2xl p-6" : "w-56 rounded-xl py-2",
            )}
          >
            {style === "mega" ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
                {!hover && link.href && link.href !== "#" && (
                  <MenuLink link={{ ...link, label: `ทั้งหมด: ${link.label}` }} className="col-span-full text-sm font-semibold text-brand-navy" onClick={close} />
                )}
                {link.children.map((child) => (
                  <div key={child.id ?? child.href ?? child.label} className="flex flex-col gap-1">
                    <MenuLink link={child} className="text-sm font-semibold text-slate-800 hover:text-brand-navy" onClick={close} />
                    {child.children?.map((g) => (
                      <MenuLink key={g.id ?? g.href ?? g.label} link={g} className="text-sm text-slate-500 hover:text-brand-navy" onClick={close} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {!hover && link.href && link.href !== "#" && <MenuLink link={link} className={cn(itemClass, "font-semibold")} onClick={close} />}
                <ChildList items={link.children} behavior={childBehavior} close={close} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
