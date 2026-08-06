"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircleIcon } from "@/components/ui/admin-icons";
import type { Role } from "@/lib/generated/prisma/client";
import { createUser } from "@/app/admin/users/actions";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy";

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CONTRIBUTOR");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createUser({ name, email, password, role: role as "ADMIN" | "APPROVER" | "CONTRIBUTOR" });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">เพิ่มผู้ใช้ / กำหนดสิทธิ์</h2>
          <button type="button" onClick={onClose} aria-label="ปิด" className="text-slate-400 hover:text-slate-600">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ชื่อ</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">อีเมล</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">สิทธิ์</label>
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="ADMIN">Admin</option>
              <option value="APPROVER">Approver</option>
              <option value="CONTRIBUTOR">Contributor</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "เพิ่มผู้ใช้"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
