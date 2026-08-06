"use client";

import { useState } from "react";
import Image from "next/image";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/ui/admin-icons";
import { SaveButton } from "@/components/admin/SaveButton";
import { Toggle } from "@/components/admin/Toggle";
import type { Banner } from "@/data/admin-banners";
import { saveBanners } from "@/app/admin/site/banners/actions";

export function BannersManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  const move = (index: number, direction: -1 | 1) => {
    setBanners((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  const update = (id: string, patch: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const remove = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const add = () => {
    setBanners((prev) => [
      ...prev,
      {
        id: `b${Date.now()}`,
        titleTh: "Banner ใหม่",
        image: "/images/news/expo-2025.svg",
        link: "/",
        order: prev.length + 1,
        active: false,
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">รายการแบนเนอร์</h2>

        <div className="flex flex-col gap-4">
          {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row"
          >
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
              <Image src={banner.image} alt={banner.titleTh} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">ชื่อ Banner</label>
                <input
                  type="text"
                  value={banner.titleTh}
                  onChange={(e) => update(banner.id, { titleTh: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">ลิงก์ปลายทาง</label>
                <input
                  type="text"
                  value={banner.link}
                  onChange={(e) => update(banner.id, { link: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-500 outline-none focus:border-brand-navy"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={banner.active}
                    onChange={(v) => update(banner.id, { active: v })}
                    label="เปิดใช้งาน Banner"
                  />
                  <span className="text-sm text-slate-500">
                    {banner.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="เลื่อนขึ้น"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="เลื่อนลง"
                    disabled={index === banners.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="ลบ Banner"
                    onClick={() => remove(banner.id)}
                    className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add Banner
        </button>
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={() => saveBanners(banners)} />
      </div>
    </div>
  );
}
