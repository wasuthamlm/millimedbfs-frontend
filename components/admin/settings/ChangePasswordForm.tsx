"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { SaveButton } from "@/components/admin/SaveButton";
import { changePassword } from "@/app/admin/settings/actions";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";
const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      const message = "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน";
      setError(message);
      throw new Error(message);
    }

    const result = await changePassword({ currentPassword, newPassword });
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Force re-login with the new password so the session can't be confused
    // with a stale credential.
    setTimeout(() => {
      void signOut({ callbackUrl: "/admin/login" });
    }, 1200);
  };

  return (
    <div className="flex max-w-md flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-900">เปลี่ยนรหัสผ่าน</h2>
        <p className="mt-1 text-sm text-slate-500">
          หลังเปลี่ยนรหัสผ่านสำเร็จ ระบบจะออกจากระบบให้เข้าสู่ระบบใหม่ด้วยรหัสผ่านใหม่
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          เปลี่ยนรหัสผ่านสำเร็จ กำลังออกจากระบบ...
        </div>
      )}

      <div>
        <label htmlFor="change-password-current" className={labelClass}>รหัสผ่านปัจจุบัน</label>
        <input
          id="change-password-current"
          type="password"
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label htmlFor="change-password-new" className={labelClass}>รหัสผ่านใหม่</label>
        <input
          id="change-password-new"
          type="password"
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-slate-400">อย่างน้อย 8 ตัวอักษร</p>
      </div>

      <div>
        <label htmlFor="change-password-confirm" className={labelClass}>ยืนยันรหัสผ่านใหม่</label>
        <input
          id="change-password-confirm"
          type="password"
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div>
        <SaveButton label="เปลี่ยนรหัสผ่าน" onSave={handleSave} />
      </div>
    </div>
  );
}
