"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { UsersIcon, PlusIcon, PencilIcon, KeyIcon, UserXIcon, UserCheckIcon, SearchIcon } from "@/components/ui/admin-icons";
import type { Role } from "@/lib/generated/prisma/client";
import { setUserRole, setUserDisabled, deleteUser } from "@/app/admin/users/actions";
import { CreateUserModal } from "./CreateUserModal";
import { ResetPasswordModal } from "./ResetPasswordModal";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
};

const ROLE_CARDS: { role: Role; label: string; description: string; colorClass: string }[] = [
  {
    role: "ADMIN",
    label: "Admin",
    description: "เข้าถึงได้ทุกส่วน รวมถึงตั้งค่าระบบ จัดการผู้ใช้",
    colorClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    role: "APPROVER",
    label: "Approver",
    description: "สร้าง/แก้ไข อนุมัติ & Publish เนื้อหาได้ แต่ไม่จัดการระบบ",
    colorClass: "border-purple-200 bg-purple-50 text-purple-700",
  },
  {
    role: "CONTRIBUTOR",
    label: "Contributor",
    description: "สร้าง/แก้ไขเนื้อหาได้ แต่ไม่ Publish หรือตั้งค่าระบบ",
    colorClass: "border-slate-200 bg-slate-100 text-slate-700",
  },
];

const ROLE_BADGE_CLASS: Record<Role, string> = {
  ADMIN: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  APPROVER: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  CONTRIBUTOR: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  CUSTOMER: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

function formatThaiDate(iso: string) {
  const d = new Date(iso);
  const buddhistYear = d.getFullYear() + 543;
  return `${d.getDate()}/${d.getMonth() + 1}/${buddhistYear}`;
}

export function UserManagementClient({
  users,
  totalCount,
  adminCount,
  currentUserId,
}: {
  users: UserRow[];
  totalCount: number;
  adminCount: number;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<Role | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = users;
    if (roleFilter) rows = rows.filter((u) => u.role === roleFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return rows;
  }, [users, roleFilter, search]);

  const handleRoleChange = async (id: string, role: Role) => {
    setError(null);
    const result = await setUserRole(id, role);
    if (result.error) setError(result.error);
    router.refresh();
  };

  const handleToggleDisabled = async (user: UserRow) => {
    setError(null);
    const result = await setUserDisabled(user.id, !user.disabled);
    if (result.error) setError(result.error);
    router.refresh();
  };

  const handleDelete = async (user: UserRow) => {
    if (!window.confirm(`ลบผู้ใช้ "${user.name}" ใช่หรือไม่?`)) return;
    setError(null);
    const result = await deleteUser(user.id);
    if (result.error) setError(result.error);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-brand-navy" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">จัดการผู้ใช้งาน</h1>
            <p className="text-sm text-slate-500">
              {totalCount} users ({adminCount} admin)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มผู้ใช้ / กำหนดสิทธิ์
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ROLE_CARDS.map((card) => {
          const active = roleFilter === card.role;
          return (
            <button
              key={card.role}
              type="button"
              onClick={() => setRoleFilter((prev) => (prev === card.role ? null : card.role))}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border bg-white p-5 text-left shadow-sm transition-colors",
                active ? "border-brand-navy ring-2 ring-brand-navy/30" : "border-slate-100 hover:border-slate-300",
              )}
            >
              <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium", card.colorClass)}>
                {card.label}
              </span>
              <p className="text-sm text-slate-500">{card.description}</p>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">ผู้ใช้งาน</th>
              <th className="px-6 py-3 font-medium">อีเมล</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium">สมัครเมื่อ</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <UsersIcon className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-slate-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{user.email}</td>
                  <td className="px-6 py-3.5">
                    {user.disabled ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-500 ring-1 ring-red-200">
                        Disabled
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) => void handleRoleChange(user.id, e.target.value as Role)}
                        className={cn(
                          "cursor-pointer rounded-full border-0 px-3 py-1 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-70",
                          ROLE_BADGE_CLASS[user.role],
                        )}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="APPROVER">Approver</option>
                        <option value="CONTRIBUTOR">Contributor</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                      {user.emailVerified ? "สมัครแล้ว" : "รอยืนยัน OTP"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{formatThaiDate(user.createdAt)}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        aria-label={`แก้ไข ${user.name}`}
                        onClick={() => setResetTarget(user)}
                        className="text-slate-400 hover:text-brand-navy"
                        title="แก้ไข"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`ตั้งรหัสผ่านใหม่ให้ ${user.name}`}
                        onClick={() => setResetTarget(user)}
                        className="text-amber-500 hover:text-amber-600"
                        title="ตั้งรหัสผ่านใหม่"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </button>
                      {!isSelf && (
                        <button
                          type="button"
                          aria-label={user.disabled ? `เปิดใช้งาน ${user.name}` : `ปิดใช้งาน ${user.name}`}
                          onClick={() => void handleToggleDisabled(user)}
                          className="text-slate-400 hover:text-red-500"
                          title={user.disabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        >
                          {user.disabled ? <UserCheckIcon className="h-4 w-4" /> : <UserXIcon className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        * &quot;รอสมัคร&quot; คือยังไม่ได้สมัคร ส่วน &quot;รอยืนยัน OTP&quot; คือสมัครแล้วแต่ยังต้องยืนยันอีเมลก่อนเข้าสู่ระบบ
      </p>

      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} />}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onDelete={() => void handleDelete(resetTarget)}
          canDelete={resetTarget.id !== currentUserId}
        />
      )}
    </div>
  );
}
