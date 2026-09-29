import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/lib/generated/prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pager } from "@/components/admin/Pager";
import { ActivityIcon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { ACTION_LABELS, TARGET_LABELS } from "@/lib/activity-log";

export const metadata: Metadata = { title: "บันทึกกิจกรรม" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

function detailText(details: Prisma.JsonValue | null): string {
  if (!details || typeof details !== "object" || Array.isArray(details)) return "";
  const d = details as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof d.note === "string") parts.push(d.note);
  if (Array.isArray(d.changedFields) && d.changedFields.length) parts.push(`แก้ไขฟิลด์: ${d.changedFields.join(", ")}`);
  return parts.join(" — ");
}

// Access is restricted to ADMIN in lib/admin-roles.ts (enforced by proxy.ts).
export default async function AdminActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const action = typeof sp.action === "string" ? sp.action : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ActivityLogWhereInput = {
    ...(action ? { action } : {}),
    ...(type ? { targetType: type } : {}),
    ...(q
      ? {
          OR: [
            { actorEmail: { contains: q, mode: "insensitive" } },
            { actorName: { contains: q, mode: "insensitive" } },
            { targetLabel: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total, actions, types] = await Promise.all([
    prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({ distinct: ["action"], select: { action: true } }),
    prisma.activityLog.findMany({ distinct: ["targetType"], select: { targetType: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = !!(q || action || type);

  const selectClass = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={ActivityIcon} title="บันทึกกิจกรรม" subtitle="ประวัติการเปลี่ยนแปลงทั้งหมดในระบบหลังบ้าน" />

      <form className="flex flex-wrap items-center gap-2" action="/admin/activity">
        <input
          name="q"
          defaultValue={q}
          placeholder="ค้นหาชื่อ, อีเมล หรือรายการ..."
          className="w-72 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select name="action" defaultValue={action} className={selectClass}>
          <option value="">ทุกการกระทำ</option>
          {actions.map((a) => (
            <option key={a.action} value={a.action}>
              {ACTION_LABELS[a.action] ?? a.action}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type} className={selectClass}>
          <option value="">ทุกประเภท</option>
          {types.map((t) => (
            <option key={t.targetType} value={t.targetType}>
              {TARGET_LABELS[t.targetType] ?? t.targetType}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white">
          ค้นหา
        </button>
        {filtered && (
          <Link href="/admin/activity" className="px-2 text-sm text-slate-500 hover:text-slate-700">
            ล้างตัวกรอง
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">เวลา</th>
              <th className="px-5 py-3 font-medium">ผู้ดำเนินการ</th>
              <th className="px-5 py-3 font-medium">การกระทำ</th>
              <th className="px-5 py-3 font-medium">ประเภท</th>
              <th className="px-5 py-3 font-medium">รายการ</th>
              <th className="px-5 py-3 font-medium">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                  ยังไม่มีบันทึกกิจกรรม
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 align-top last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                    {row.createdAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700">{row.actorName || row.actorEmail}</p>
                    {row.actorName && <p className="text-xs text-slate-400">{row.actorEmail}</p>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="rounded-full bg-brand-navy/10 px-2.5 py-1 text-xs font-medium text-brand-navy">
                      {ACTION_LABELS[row.action] ?? row.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">{TARGET_LABELS[row.targetType] ?? row.targetType}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-slate-700" title={row.targetLabel ?? ""}>
                    {row.targetLabel || "-"}
                  </td>
                  <td className="max-w-md px-5 py-3 text-xs text-slate-500">{detailText(row.details)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} basePath="/admin/activity" extraParams={{ q, action, type }} />
    </div>
  );
}
