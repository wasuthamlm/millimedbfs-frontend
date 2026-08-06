"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircleIcon, TrashIcon } from "@/components/ui/admin-icons";
import { resetUserPassword } from "@/app/admin/users/actions";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy";

export function ResetPasswordModal({
  user,
  onClose,
  onDelete,
  canDelete,
}: {
  user: { id: string; name: string; email: string };
  onClose: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await resetUserPassword(user.id, password);
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
          <div>
            <h2 className="text-lg font-semibold text-slate-900">จัดการผู้ใช้</h2>
            <p className="text-sm text-slate-500">
              {user.name} · {user.email}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="text-slate-400 hover:text-slate-600">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">ตั้งรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex items-center justify-between gap-2">
            {canDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                ลบผู้ใช้
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
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
                {saving ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
