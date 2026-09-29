"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { ArchiveIcon, InboxIcon, MailIcon, TrashIcon, XCircleIcon } from "@/components/ui/admin-icons";
import { deleteMessages, setMessageStatus } from "@/app/admin/messages/actions";

type Message = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  body: string;
  status: "NEW" | "READ" | "ARCHIVED";
  customFields: Record<string, string>;
  createdAt: string;
};

const fmt = (iso: string) => new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });

export function MessagesClient({
  messages,
  unread,
  filter,
  q,
  page,
  totalPages,
  canDelete,
}: {
  messages: Message[];
  unread: number;
  filter: "all" | "unread" | "archived";
  q: string;
  page: number;
  totalPages: number;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const open = messages.find((m) => m.id === openId) ?? null;

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  const openMessage = (m: Message) => {
    setOpenId(m.id);
    if (m.status === "NEW") run(() => setMessageStatus([m.id], "READ"));
  };

  const remove = (ids: string[]) => {
    if (!window.confirm(`ลบข้อความ ${ids.length} รายการ? การลบไม่สามารถกู้คืนได้`)) return;
    setOpenId((cur) => (cur && ids.includes(cur) ? null : cur));
    setSelected(new Set());
    run(() => deleteMessages(ids));
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const tab = (key: typeof filter, label: string) => (
    <Link
      href={key === "all" ? "/admin/messages" : `/admin/messages?filter=${key}`}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium",
        filter === key ? "bg-brand-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={MailIcon} title="ข้อความติดต่อ" subtitle={`ยังไม่อ่าน ${unread} ข้อความ`} />

      <div className="flex flex-wrap items-center gap-2">
        {tab("all", "กล่องข้อความ")}
        {tab("unread", `ยังไม่อ่าน (${unread})`)}
        {tab("archived", "เก็บถาวร")}
        <form action="/admin/messages" className="ml-auto">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อ อีเมล หรือข้อความ..."
            className="w-64 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          />
        </form>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <span className="text-slate-500">เลือกแล้ว {selected.size} รายการ</span>
          <button type="button" disabled={pending} onClick={() => run(() => setMessageStatus([...selected], "READ"))} className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
            ทำเครื่องหมายว่าอ่านแล้ว
          </button>
          <button type="button" disabled={pending} onClick={() => run(() => setMessageStatus([...selected], "NEW"))} className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
            ทำเครื่องหมายว่ายังไม่อ่าน
          </button>
          <button type="button" disabled={pending} onClick={() => run(() => setMessageStatus([...selected], filter === "archived" ? "READ" : "ARCHIVED"))} className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
            {filter === "archived" ? "ย้ายกลับกล่องข้อความ" : "เก็บถาวร"}
          </button>
          {canDelete && (
            <button type="button" disabled={pending} onClick={() => remove([...selected])} className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50">
              ลบ
            </button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <InboxIcon className="h-8 w-8" />
            ไม่มีข้อความ
          </div>
        ) : (
          <ul>
            {messages.map((m) => (
              <li key={m.id} className={cn("flex items-start gap-3 border-b border-slate-50 px-4 py-3 last:border-0", m.id === openId && "bg-brand-navy/5")}>
                <input
                  type="checkbox"
                  checked={selected.has(m.id)}
                  onChange={() => toggle(m.id)}
                  aria-label={`เลือกข้อความจาก ${m.name}`}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <button type="button" onClick={() => openMessage(m)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", m.status === "NEW" ? "bg-orange-500" : "bg-transparent")} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={cn("truncate text-sm", m.status === "NEW" ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
                        {m.name}
                        {m.email && <span className="ml-2 font-normal text-slate-400">{m.email}</span>}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">{fmt(m.createdAt)}</span>
                    </span>
                    <span className="block truncate text-sm text-slate-600">{m.subject || m.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/messages" extraParams={{ q, filter: filter === "all" ? undefined : filter }} />

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setOpenId(null)}>
          <aside className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="truncate text-base font-bold text-slate-900">{open.subject || "ข้อความติดต่อ"}</h2>
              <button type="button" onClick={() => setOpenId(null)} aria-label="ปิด" className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4 p-5 text-sm">
              <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2">
                <dt className="text-slate-400">ชื่อ</dt>
                <dd className="text-slate-800">{open.name}</dd>
                {open.email && (
                  <>
                    <dt className="text-slate-400">อีเมล</dt>
                    <dd>
                      <a href={`mailto:${open.email}`} className="text-brand-navy hover:underline">{open.email}</a>
                    </dd>
                  </>
                )}
                {open.phone && (
                  <>
                    <dt className="text-slate-400">โทรศัพท์</dt>
                    <dd>
                      <a href={`tel:${open.phone}`} className="text-brand-navy hover:underline">{open.phone}</a>
                    </dd>
                  </>
                )}
                {Object.entries(open.customFields).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="text-slate-800">{v}</dd>
                  </div>
                ))}
                <dt className="text-slate-400">ได้รับเมื่อ</dt>
                <dd className="text-slate-800">{fmt(open.createdAt)}</dd>
              </dl>
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-800">{open.body}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={pending} onClick={() => run(() => setMessageStatus([open.id], open.status === "NEW" ? "READ" : "NEW"))} className="rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  {open.status === "NEW" ? "ทำเครื่องหมายว่าอ่านแล้ว" : "ทำเครื่องหมายว่ายังไม่อ่าน"}
                </button>
                <button type="button" disabled={pending} onClick={() => run(() => setMessageStatus([open.id], open.status === "ARCHIVED" ? "READ" : "ARCHIVED"))} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <ArchiveIcon className="h-4 w-4" />
                  {open.status === "ARCHIVED" ? "ย้ายกลับกล่องข้อความ" : "เก็บถาวร"}
                </button>
                {canDelete && (
                  <button type="button" disabled={pending} onClick={() => remove([open.id])} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" />
                    ลบ
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
