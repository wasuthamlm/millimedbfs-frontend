"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/ui/admin-icons";
import { Toggle } from "@/components/admin/Toggle";
import { FloatingButton, type FloatingWidget } from "@/components/layout/FloatingWidgets";
import {
  deleteFloatingWidget,
  reorderFloatingWidgets,
  saveFloatingWidget,
  type FloatingWidgetInput,
} from "@/app/admin/site/widgets/actions";

export type FloatingWidgetRow = FloatingWidget & { enabled: boolean };

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

const EMPTY: FloatingWidgetInput = {
  labelTh: "",
  labelEn: "",
  type: "line",
  icon: "message",
  link: "",
  phone: "",
  position: "bottom-right",
  design: "pill",
  color: "#06C755",
  openInNewTab: true,
  enabled: true,
};

const TYPE_DEFAULTS: Record<FloatingWidgetInput["type"], Partial<FloatingWidgetInput>> = {
  line: { icon: "message", color: "#06C755" },
  phone: { icon: "phone", color: "#1B5E4B" },
  url: { icon: "external-link", color: "#032f87" },
  signup: { icon: "user-plus", color: "#032f87" },
  login: { icon: "log-in", color: "#032f87" },
};

/** Create / edit / reorder the admin-built floating buttons (legacy AdminWidgets). */
export function FloatingWidgetsManager({ widgets, canDelete }: { widgets: FloatingWidgetRow[]; canDelete: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<{ id: string | null; form: FloatingWidgetInput } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ error?: string } | object>) =>
    startTransition(async () => {
      const res = (await fn()) as { error?: string };
      if (res?.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setEditing(null);
      router.refresh();
    });

  const edit = (w: FloatingWidgetRow) =>
    setEditing({
      id: w.id,
      form: {
        labelTh: w.labelTh,
        labelEn: w.labelEn ?? "",
        type: w.type as FloatingWidgetInput["type"],
        icon: w.icon as FloatingWidgetInput["icon"],
        link: w.link ?? "",
        phone: w.phone ?? "",
        position: w.position as FloatingWidgetInput["position"],
        design: w.design as FloatingWidgetInput["design"],
        color: w.color,
        openInNewTab: w.openInNewTab,
        enabled: w.enabled,
      },
    });

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= widgets.length) return;
    const ids = widgets.map((w) => w.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run(() => reorderFloatingWidgets(ids));
  };

  const form = editing?.form;
  const set = <K extends keyof FloatingWidgetInput>(k: K, v: FloatingWidgetInput[K]) =>
    setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">ปุ่มลอยที่สร้างเอง</h2>
          <p className="text-xs text-slate-400">ปุ่มโทร / LINE / ลิงก์ ที่ลอยอยู่ข้างจอ</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing({ id: null, form: EMPTY })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-sm font-medium text-white"
          >
            <PlusIcon className="h-4 w-4" />
            เพิ่มปุ่ม
          </button>
        )}
      </div>

      {widgets.length === 0 && !editing && <p className="py-4 text-center text-sm text-slate-400">ยังไม่มีปุ่มลอย</p>}
      <ul className="flex flex-col divide-y divide-slate-100">
        {widgets.map((w, i) => (
          <li key={w.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="pointer-events-none origin-left scale-75">
              <FloatingButton widget={w} />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium text-slate-800">{w.labelTh}</p>
              <p className="truncate text-xs text-slate-400">
                {w.type === "phone" ? w.phone : w.link} · {w.position}
              </p>
            </div>
            <Toggle checked={w.enabled} onChange={(v) => run(() => saveFloatingWidget(w.id, { ...toInput(w), enabled: v }))} label="เปิดใช้งาน" />
            <button type="button" aria-label="เลื่อนขึ้น" disabled={i === 0 || pending} onClick={() => move(i, -1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
              <ArrowUpIcon className="h-4 w-4" />
            </button>
            <button type="button" aria-label="เลื่อนลง" disabled={i === widgets.length - 1 || pending} onClick={() => move(i, 1)} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
              <ArrowDownIcon className="h-4 w-4" />
            </button>
            <button type="button" aria-label="แก้ไข" onClick={() => edit(w)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">
              <PencilIcon className="h-4 w-4" />
            </button>
            {canDelete && (
              <button
                type="button"
                aria-label="ลบ"
                onClick={() => window.confirm(`ลบปุ่ม "${w.labelTh}"?`) && run(() => deleteFloatingWidget(w.id))}
                className="rounded p-1.5 text-red-500 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {form && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-brand-navy/20 bg-slate-50/50 p-4 sm:grid-cols-2">
          <h3 className="text-sm font-semibold text-slate-800 sm:col-span-2">{editing?.id ? "แก้ไขปุ่ม" : "ปุ่มใหม่"}</h3>
          <div>
            <label className={labelClass}>ข้อความปุ่ม (TH)</label>
            <input className={inputClass} value={form.labelTh} onChange={(e) => set("labelTh", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ข้อความปุ่ม (EN)</label>
            <input className={inputClass} value={form.labelEn} onChange={(e) => set("labelEn", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>ประเภท</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => {
                const type = e.target.value as FloatingWidgetInput["type"];
                setEditing((ed) => (ed ? { ...ed, form: { ...ed.form, type, ...TYPE_DEFAULTS[type] } } : ed));
              }}
            >
              <option value="line">LINE</option>
              <option value="phone">โทรศัพท์</option>
              <option value="url">ลิงก์</option>
              <option value="signup">สมัครสมาชิก</option>
              <option value="login">เข้าสู่ระบบ</option>
            </select>
          </div>
          {form.type === "phone" ? (
            <div>
              <label className={labelClass}>เบอร์โทร</label>
              <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="02-123-4567" />
            </div>
          ) : (
            <div>
              <label className={labelClass}>ลิงก์</label>
              <input className={inputClass} value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://line.me/R/ti/p/@..." />
            </div>
          )}
          <div>
            <label className={labelClass}>ไอคอน</label>
            <select className={inputClass} value={form.icon} onChange={(e) => set("icon", e.target.value as FloatingWidgetInput["icon"])}>
              {["message", "phone", "mail", "user-plus", "log-in", "shopping-bag", "external-link"].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>ตำแหน่ง</label>
            <select className={inputClass} value={form.position} onChange={(e) => set("position", e.target.value as FloatingWidgetInput["position"])}>
              <option value="bottom-right">ขวาล่าง</option>
              <option value="bottom-left">ซ้ายล่าง</option>
              <option value="middle-right">ขวากลาง</option>
              <option value="middle-left">ซ้ายกลาง</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>รูปแบบ</label>
            <select className={inputClass} value={form.design} onChange={(e) => set("design", e.target.value as FloatingWidgetInput["design"])}>
              <option value="pill">แคปซูล (มีข้อความ)</option>
              <option value="circle">วงกลม</option>
              <option value="square">สี่เหลี่ยม</option>
              <option value="minimal">มินิมอล</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>สี</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="h-9 w-11 rounded border border-slate-200 p-1" />
              <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.openInNewTab} onChange={(e) => set("openInNewTab", e.target.checked)} />
            เปิดในแท็บใหม่
          </label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <span className="text-xs text-slate-500">ตัวอย่าง:</span>
            <div className="pointer-events-none">
              <FloatingButton widget={{ id: "preview", ...form, labelEn: form.labelEn || null, link: form.link || null, phone: form.phone || null }} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" disabled={pending} onClick={() => run(() => saveFloatingWidget(editing!.id, form))} className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function toInput(w: FloatingWidgetRow): FloatingWidgetInput {
  return {
    labelTh: w.labelTh,
    labelEn: w.labelEn ?? "",
    type: w.type as FloatingWidgetInput["type"],
    icon: w.icon as FloatingWidgetInput["icon"],
    link: w.link ?? "",
    phone: w.phone ?? "",
    position: w.position as FloatingWidgetInput["position"],
    design: w.design as FloatingWidgetInput["design"],
    color: w.color,
    openInNewTab: w.openInNewTab,
    enabled: w.enabled,
  };
}
