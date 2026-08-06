"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { cn } from "@/lib/utils";
import type { FooterColumn } from "@/data/admin-footer";
import { saveFooterConfig, type FooterThemeInput } from "@/app/admin/site/footer/actions";

type FooterContactState = { phone: string; email: string; address: string; tagline: string };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-slate-200 p-1"
        />
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export function FooterManager({
  initialColumns,
  initialContact,
  initialTheme,
}: {
  initialColumns: FooterColumn[];
  initialContact: FooterContactState;
  initialTheme: FooterThemeInput;
}) {
  const [columns, setColumns] = useState<FooterColumn[]>(initialColumns);
  const [contact, setContact] = useState<FooterContactState>(initialContact);
  const [theme, setTheme] = useState<FooterThemeInput>(initialTheme);
  const [activeTab, setActiveTab] = useState(0);
  const [previewLang, setPreviewLang] = useState<"th" | "en">("th");

  const updateTheme = <K extends keyof FooterThemeInput>(key: K, value: FooterThemeInput[K]) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

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

  const addColumn = () => {
    setColumns((prev) => [...prev, { id: `c${Date.now()}`, title: `คอลัมน์ใหม่`, links: [] }]);
  };

  const removeColumn = (colId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== colId));
    setActiveTab(0);
  };

  const visibleColumns = columns.slice(0, theme.desktopColumns);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">สี Footer</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField label="พื้นหลัง Footer" value={theme.bgColor} onChange={(v) => updateTheme("bgColor", v)} />
          <ColorField label="ตัวอักษร Footer" value={theme.textColor} onChange={(v) => updateTheme("textColor", v)} />
          <ColorField
            label="Accent / Hover / Active"
            value={theme.accentColor}
            onChange={(v) => updateTheme("accentColor", v)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">เลือกจำนวนคอลัมน์ (Desktop Grid)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => updateTheme("desktopColumns", n)}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                theme.desktopColumns === n
                  ? "border-brand-navy bg-brand-navy/5 text-brand-navy"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {n} คอลัมน์{n === 3 && " (แนะนำ)"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-4">
          {visibleColumns.map((col, i) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveTab(i)}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === i
                  ? "border-brand-navy text-brand-navy"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {col.title || `คอลัมน์ ${i + 1}`} ({col.links.length} ลิงก์)
            </button>
          ))}
          {visibleColumns.length < theme.desktopColumns && (
            <button
              type="button"
              onClick={addColumn}
              className="inline-flex shrink-0 items-center gap-1 px-4 py-3 text-sm font-medium text-brand-navy hover:text-brand-navy-dark"
            >
              <PlusIcon className="h-4 w-4" />
              เพิ่มคอลัมน์
            </button>
          )}
        </div>

        <div className="p-5">
          {visibleColumns[activeTab] ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={visibleColumns[activeTab].title}
                  onChange={(e) => updateColumnTitle(visibleColumns[activeTab].id, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-navy"
                  placeholder="ชื่อคอลัมน์"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(visibleColumns[activeTab].id)}
                  className="rounded-md p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="ลบคอลัมน์"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {visibleColumns[activeTab].links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) =>
                        updateLink(visibleColumns[activeTab].id, link.id, { label: e.target.value })
                      }
                      className="w-40 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-navy"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) =>
                        updateLink(visibleColumns[activeTab].id, link.id, { href: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-mono text-slate-500 outline-none focus:border-brand-navy"
                    />
                    <button
                      type="button"
                      aria-label="ลบลิงก์"
                      onClick={() => removeLink(visibleColumns[activeTab].id, link.id)}
                      className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {visibleColumns[activeTab].links.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                    ไม่มีลิงก์ในคอลัมน์นี้ กดปุ่มด้านล่างเพื่อเพิ่มลิงก์แรก
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => addLink(visibleColumns[activeTab].id)}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-brand-navy hover:bg-slate-50"
              >
                <PlusIcon className="h-4 w-4" />
                เพิ่มลิงก์
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-slate-400">ยังไม่มีคอลัมน์ กดเพิ่มคอลัมน์ด้านบนเพื่อเริ่มต้น</p>
              <button
                type="button"
                onClick={addColumn}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
              >
                <PlusIcon className="h-4 w-4" />
                เพิ่มคอลัมน์
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-slate-800">ข้อมูลติดต่อใน Footer</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Tagline</label>
            <input
              type="text"
              value={contact.tagline}
              onChange={(e) => setContact({ ...contact, tagline: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">เบอร์โทร</label>
            <input
              type="text"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">อีเมล</label>
            <input
              type="text"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ที่อยู่</label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">นโยบายลิขสิทธิ์ (Bottom Bar)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ข้อความลิขสิทธิ์ (TH)</label>
            <input
              type="text"
              value={theme.copyrightTh}
              onChange={(e) => updateTheme("copyrightTh", e.target.value)}
              placeholder={`© ${new Date().getFullYear()} Millimed BFS สงวนลิขสิทธิ์`}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ข้อความลิขสิทธิ์ (EN)</label>
            <input
              type="text"
              value={theme.copyrightEn}
              onChange={(e) => updateTheme("copyrightEn", e.target.value)}
              placeholder={`© ${new Date().getFullYear()} Millimed BFS. All rights reserved.`}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: theme.bgColor }}>
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.accentColor }}>
            Live Preview
          </p>
          <button
            type="button"
            onClick={() => setPreviewLang((l) => (l === "th" ? "en" : "th"))}
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: theme.accentColor, color: theme.bgColor }}
          >
            ภาษาไทย ({previewLang.toUpperCase()})
          </button>
        </div>
        <div
          className="grid gap-6 px-6 pb-6"
          style={{ gridTemplateColumns: `repeat(${Math.max(theme.desktopColumns, 1)}, minmax(0, 1fr))` }}
        >
          {visibleColumns.length === 0 && (
            <p className="text-sm opacity-60" style={{ color: theme.textColor }}>
              ยังไม่มีคอลัมน์
            </p>
          )}
          {visibleColumns.map((col, i) => (
            <div key={col.id}>
              <p className="mb-2 text-xs font-semibold uppercase opacity-60" style={{ color: theme.textColor }}>
                COL {i + 1}
              </p>
              <p className="mb-2 text-sm font-semibold" style={{ color: theme.textColor }}>
                {col.title}
              </p>
              <ul className="flex flex-col gap-1">
                {col.links.map((l) => (
                  <li key={l.id} className="text-sm opacity-80" style={{ color: theme.textColor }}>
                    {l.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="border-t px-6 py-3 text-center text-xs opacity-70"
          style={{ borderColor: theme.accentColor + "33", color: theme.textColor }}
        >
          {previewLang === "th"
            ? theme.copyrightTh || `© ${new Date().getFullYear()} Millimed BFS สงวนลิขสิทธิ์`
            : theme.copyrightEn || `© ${new Date().getFullYear()} Millimed BFS. All rights reserved.`}
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={() => saveFooterConfig(columns, contact, theme)} />
      </div>
    </div>
  );
}
