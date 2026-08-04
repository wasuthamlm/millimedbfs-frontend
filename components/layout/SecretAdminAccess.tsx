"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

const CLICKS_REQUIRED = 5;
const CLICK_WINDOW_MS = 1500;

export function SecretAdminAccess() {
  const router = useRouter();
  const clickCountRef = useRef(0);
  const lastClickAtRef = useRef(0);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickAtRef.current > CLICK_WINDOW_MS) {
      clickCountRef.current = 0;
    }
    lastClickAtRef.current = now;
    clickCountRef.current += 1;

    if (clickCountRef.current >= CLICKS_REQUIRED) {
      clickCountRef.current = 0;
      router.push("/admin/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      tabIndex={-1}
      aria-hidden="true"
      className="fixed bottom-0 left-0 z-50 h-8 w-8 cursor-default border-0 bg-transparent p-0 opacity-0"
    />
  );
}
