import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/admin/PageHeader";
import { Share2Icon, PlusIcon } from "@/components/ui/admin-icons";
import { BulkActionBar, RowCheckbox, SelectAllCheckbox, SelectionProvider, type BulkAction } from "@/components/admin/list/Selection";
import { TrashToolbar } from "@/components/admin/list/TrashToolbar";
import { TrashRowMenu } from "@/components/admin/list/TrashRowMenu";
import { PopupOrderButtons } from "@/components/admin/site/PopupOrderButtons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import {
  activatePopups,
  deactivatePopups,
  draftPopups,
  emptyPopupTrash,
  publishPopups,
  purgePopups,
  restorePopups,
  trashPopups,
} from "./actions";

export const metadata: Metadata = { title: "จัดการ Popup" };
export const dynamic = "force-dynamic";

const LAYOUT_LABEL: Record<string, string> = { "image-top": "รูปบน", "image-left": "รูปซ้าย", "image-only": "รูปอย่างเดียว", "text-only": "ข้อความ" };

export default async function AdminPopupPage({ searchParams }: PageProps<"/admin/site/popup">) {
  const inTrash = (await searchParams).trash === "1";
  const [popups, trashCount, role] = await Promise.all([
    prisma.popup.findMany({ where: { deletedAt: inTrash ? { not: null } : null }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.popup.count({ where: { deletedAt: { not: null } } }),
    getAdminRole(),
  ]);
  const canPublish = canDo(role, "popup.publish");
  const canDelete = canDo(role, "popup.delete");
  const today = new Date();

  const bulk: BulkAction[] = inTrash
    ? canDelete
      ? [
          { label: "กู้คืน", run: restorePopups },
          { label: "ลบถาวร", run: purgePopups, tone: "danger", confirm: "ลบถาวร {n} รายการ?" },
        ]
      : []
    : [
        ...(canPublish
          ? [
              { label: "เผยแพร่", run: publishPopups },
              { label: "เป็นฉบับร่าง", run: draftPopups },
            ]
          : []),
        { label: "เปิดใช้งาน", run: activatePopups },
        { label: "ปิดใช้งาน", run: deactivatePopups },
        ...(canDelete ? [{ label: "ย้ายไปถังขยะ", run: trashPopups, tone: "danger" as const, confirm: "ย้าย {n} รายการไปถังขยะ?" }] : []),
      ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader icon={Share2Icon} title="จัดการ Popup" subtitle="แสดง Popup แรกที่เข้าเงื่อนไขตามลำดับ (เผยแพร่ + เปิดใช้งาน + อยู่ในช่วงวันที่)" />
        <Link href="/admin/site/popup/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark">
          <PlusIcon className="h-4 w-4" />
          เพิ่ม Popup
        </Link>
      </div>
      <TrashToolbar basePath="/admin/site/popup" inTrash={inTrash} trashCount={trashCount} canDelete={canDelete} onEmpty={emptyPopupTrash} />
      <SelectionProvider>
        <BulkActionBar actions={bulk} />
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <SelectAllCheckbox ids={popups.map((p) => p.id)} />
                </th>
                <th className="px-4 py-3 font-medium">Popup</th>
                <th className="px-4 py-3 font-medium">รูปแบบ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ช่วงวันที่</th>
                <th className="px-4 py-3 font-medium">ลำดับ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {popups.map((p, i) => {
                const expired = p.endDate && p.endDate < today;
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <RowCheckbox id={p.id} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                          {p.imageUrl && <Image src={p.imageUrl} alt="" fill className="object-cover" unoptimized />}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/site/popup/${p.id}`} className="block truncate font-medium text-slate-800 hover:text-brand-navy">
                            {p.titleTh || "(ไม่มีหัวข้อ)"}
                          </Link>
                          <p className="text-xs text-slate-400">{p.homeOnly ? "เฉพาะหน้าแรก" : "ทุกหน้า"} · หน่วง {p.delaySeconds} วินาที</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {LAYOUT_LABEL[p.layout] ?? p.layout} · {p.size.toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`mr-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {p.status === "PUBLISHED" ? "เผยแพร่" : "ฉบับร่าง"}
                      </span>
                      {!p.active && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">ปิดอยู่</span>}
                      {expired && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600">หมดอายุ</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {p.startDate ? p.startDate.toLocaleDateString("th-TH") : "—"} → {p.endDate ? p.endDate.toLocaleDateString("th-TH") : "—"}
                    </td>
                    <td className="px-4 py-3">{!inTrash && <PopupOrderButtons ids={popups.map((x) => x.id)} index={i} />}</td>
                    <td className="px-4 py-3">
                      <TrashRowMenu
                        id={p.id}
                        editHref={`/admin/site/popup/${p.id}`}
                        inTrash={inTrash}
                        canDelete={canDelete}
                        onTrash={trashPopups}
                        onRestore={restorePopups}
                        onPurge={purgePopups}
                        noun="Popup"
                      />
                    </td>
                  </tr>
                );
              })}
              {popups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    {inTrash ? "ถังขยะว่างเปล่า" : "ยังไม่มี Popup"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SelectionProvider>
    </div>
  );
}
