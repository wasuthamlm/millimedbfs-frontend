"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { navLinks, type NavLink } from "@/data/nav";

let nextId = 1000;

export function HeaderManager() {
  const [items, setItems] = useState<NavLink[]>(navLinks);

  const move = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateLabel = (index: number, label: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, label } : item)));
  };

  const updateHref = (index: number, href: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, href } : item)));
  };

  const remove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const add = () => {
    nextId += 1;
    setItems((prev) => [...prev, { label: "เมนูใหม่", href: `/menu-${nextId}` }]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">รายการเมนูบน Navbar</p>
            <p className="text-xs text-slate-400">ลากลำดับด้วยปุ่มขึ้น/ลง แก้ไขชื่อและลิงก์ได้โดยตรง</p>
          </div>
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-3 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
          >
            <PlusIcon className="h-4 w-4" />
            เพิ่มเมนู
          </button>
        </div>

        <div className="flex flex-col divide-y divide-slate-50">
          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap items-center gap-3 px-6 py-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="เลื่อนขึ้น"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="เลื่อนลง"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateLabel(index, e.target.value)}
                className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateHref(index, e.target.value)}
                className="flex-1 min-w-[160px] rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-500 outline-none focus:border-brand-navy"
              />
              {item.children && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                  {item.children.length} ซับเมนู
                </span>
              )}
              <button
                type="button"
                aria-label="ลบเมนู"
                onClick={() => remove(index)}
                className="ml-auto rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  );
}
