"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="text-sm text-slate-500">ขออภัยในความไม่สะดวก กรุณาลองใหม่อีกครั้ง</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}
