"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { footerColumns as initialColumns, footerContact, type FooterColumn } from "@/data/admin-footer";

export function FooterManager() {
  const [columns, setColumns] = useState<FooterColumn[]>(initialColumns);
  const [contact, setContact] = useState(footerContact);

  const updateColumnTitle = (colId: string, title: string) => {
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, title } : c)));
  };

  const updateLink = (colId: string, linkId: string, patch: { label?: string; href?: string }) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === colId
          ? { ...c, links: c.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)) }
          : c
      )
    );
  };

  const removeLink = (colId: string, linkId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, links: c.links.filter((l) => l.id !== linkId) } : c))
    );
  };

  const addLink = (colId: string) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === colId
          ? { ...c, links: [...c.links, { id: `l${Date.now()}`, label: "ลิงก์ใหม่", href: "/" }] }
          : c
      )
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {columns.map((column) => (
          <div key={column.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <input
              type="text"
              value={column.title}
              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-navy"
            />
            <div className="flex flex-col gap-2">
              {column.links.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(column.id, link.id, { label: e.target.value })}
                    className="w-32 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-navy"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(column.id, link.id, { href: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono text-slate-500 outline-none focus:border-brand-navy"
                  />
                  <button
                    type="button"
                    aria-label="ลบลิงก์"
                    onClick={() => removeLink(column.id, link.id)}
                    className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addLink(column.id)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
            >
              <PlusIcon className="h-4 w-4" />
              เพิ่มลิงก์
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-slate-800">ข้อมูลติดต่อใน Footer</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Tagline</label>
            <input
              type="text"
              value={contact.tagline}
              onChange={(e) => setContact({ ...contact, tagline: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">เบอร์โทร</label>
            <input
              type="text"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">อีเมล</label>
            <input
              type="text"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ที่อยู่</label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  );
}
