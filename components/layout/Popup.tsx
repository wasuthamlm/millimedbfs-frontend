"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@/components/ui/icons";

export type PopupData = {
  titleTh: string;
  image: string;
  link: string | null;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
};

const STORAGE_KEY = "millimedbfs_popup_last_shown";

function shouldShow(frequency: string | null): boolean {
  if (frequency === "every-visit" || !frequency) return true;

  const store = frequency === "once-per-session" ? sessionStorage : localStorage;
  const last = store.getItem(STORAGE_KEY);
  if (!last) return true;

  if (frequency === "once-per-day") {
    const lastDate = new Date(last);
    const now = new Date();
    return lastDate.toDateString() !== now.toDateString();
  }

  return false;
}

function markShown(frequency: string | null) {
  const store = frequency === "once-per-session" ? sessionStorage : localStorage;
  store.setItem(STORAGE_KEY, new Date().toISOString());
}

export function Popup({ data }: { data: PopupData | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!data) return;

    if (data.startDate && new Date() < new Date(data.startDate)) return;
    if (data.endDate && new Date() > new Date(data.endDate)) return;
    if (!shouldShow(data.frequency)) return;

    setOpen(true);
    markShown(data.frequency);
  }, [data]);

  if (!data) return null;

  const image = (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl">
      <Image src={data.image} alt={data.titleTh} fill className="object-cover" />
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="ปิด"
              onClick={() => setOpen(false)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-md hover:text-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
            {data.link ? (
              <Link href={data.link} onClick={() => setOpen(false)}>
                {image}
              </Link>
            ) : (
              image
            )}
            <p className="mt-3 text-center text-sm font-medium text-slate-800">{data.titleTh}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
