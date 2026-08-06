"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  SearchIcon,
  GridIcon,
  ListIconGlyph,
  FolderIcon,
  UploadCloudIcon,
  CopyIcon,
  TrashIcon,
  PlusIcon,
} from "@/components/ui/admin-icons";
import { Pager } from "@/components/admin/Pager";
import { FolderSelect } from "@/components/admin/media/FolderSelect";
import { createMediaFolder, deleteMedia, setMediaFolder } from "@/app/admin/media/actions";

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  folderId: string | null;
  usageCount: number;
};

type FolderOption = { id: string; name: string; count: number };

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE = 5 * 1024 * 1024;

export function MediaLibraryClient({
  media,
  folders,
  totalAll,
  uncategorizedCount,
  unusedCount,
  activeFolder,
  q,
  page,
  totalPages,
}: {
  media: MediaItem[];
  folders: FolderOption[];
  totalAll: number;
  uncategorizedCount: number;
  unusedCount: number;
  activeFolder: string;
  q: string;
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(q);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === media.length ? new Set() : new Set(media.map((m) => m.id))));
  };

  const handleFiles = async (files: FileList | File[]) => {
    setUploadError(null);
    const list = Array.from(files);
    if (list.length === 0) return;

    for (const file of list) {
      if (!ALLOWED_TYPES.has(file.type)) {
        setUploadError("รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF)");
        continue;
      }
      if (file.size > MAX_SIZE) {
        setUploadError("ขนาดไฟล์ต้องไม่เกิน 5MB");
        continue;
      }
    }

    const valid = list.filter((file) => ALLOWED_TYPES.has(file.type) && file.size <= MAX_SIZE);
    if (valid.length === 0) return;

    setUploading(true);
    try {
      for (const file of valid) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setUploadError(data?.error ?? "อัปโหลดไม่สำเร็จ");
        }
      }
      router.refresh();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    const result = await createMediaFolder(name);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    setNewFolderName("");
    router.refresh();
  };

  const handleAssignFolder = async (ids: string[], folderId: string) => {
    await setMediaFolder(ids, folderId || null);
    router.refresh();
  };

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (!window.confirm(`ต้องการลบไฟล์ ${ids.length} รายการใช่หรือไม่?`)) return;
    await deleteMedia(ids);
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    router.refresh();
  };

  const handleCopy = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId((cur) => (cur === item.id ? null : cur)), 1500);
  };

  const tabClass = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-brand-navy bg-brand-navy text-white"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-brand-navy" />
          <h1 className="text-2xl font-bold text-slate-900">คลังสื่อ</h1>
          <span className="text-sm font-normal text-slate-400">({totalAll} ไฟล์)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาไฟล์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setParam("q", search);
              }}
              onBlur={() => setParam("q", search)}
              className="w-64 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="มุมมองตาราง"
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "grid" ? "bg-brand-navy text-white" : "text-slate-400 hover:bg-slate-50",
              )}
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="มุมมองรายการ"
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "list" ? "bg-brand-navy text-white" : "text-slate-400 hover:bg-slate-50",
              )}
            >
              <ListIconGlyph className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Upload Image (แนะนำ: 1200x800px)</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 text-center transition-colors",
            dragOver ? "border-brand-navy bg-brand-navy/5" : "border-slate-200 hover:bg-slate-50",
          )}
        >
          <UploadCloudIcon className="h-6 w-6 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดรูปภาพ"}
          </p>
          <p className="text-xs text-slate-400">รองรับ JPG, PNG, GIF, WEBP</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
          }}
        />
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={tabClass(activeFolder === "all")} onClick={() => setParam("folder", "")}>
          <FolderIcon className="h-3.5 w-3.5" />
          ทั้งหมด
          <span className="opacity-70">{totalAll}</span>
        </button>
        <button
          type="button"
          className={tabClass(activeFolder === "uncategorized")}
          onClick={() => setParam("folder", "uncategorized")}
        >
          <FolderIcon className="h-3.5 w-3.5" />
          ยังไม่จัดหมวด
          <span className="opacity-70">{uncategorizedCount}</span>
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            className={tabClass(activeFolder === folder.id)}
            onClick={() => setParam("folder", folder.id)}
          >
            <FolderIcon className="h-3.5 w-3.5" />
            {folder.name}
            <span className="opacity-70">{folder.count}</span>
          </button>
        ))}
        <button
          type="button"
          className={tabClass(activeFolder === "unused")}
          onClick={() => setParam("folder", "unused")}
        >
          <FolderIcon className="h-3.5 w-3.5" />
          ไม่ได้ใช้
          <span className="opacity-70">{unusedCount}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="โฟลเดอร์ใหม่..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreateFolder();
            }}
            className="w-32 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-navy"
          />
          <button
            type="button"
            onClick={() => void handleCreateFolder()}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            เพิ่ม
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={media.length > 0 && selected.size === media.length}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
          />
          เลือกทั้งหมด ({media.length})
        </label>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">เลือกแล้ว {selected.size} รายการ</span>
            <FolderSelect
              value=""
              placeholder="ย้ายไปโฟลเดอร์..."
              className="w-44"
              options={[
                { value: "__none__", label: "ยังไม่จัดหมวด" },
                ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
              ]}
              onChange={(value) => void handleAssignFolder(Array.from(selected), value === "__none__" ? "" : value)}
            />
            <button
              type="button"
              onClick={() => void handleDelete(Array.from(selected))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              ลบที่เลือก
            </button>
          </div>
        )}
      </div>

      {media.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-slate-400">
          ไม่พบไฟล์ในหมวดนี้
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="relative aspect-[16/9] bg-slate-50">
                <label className="absolute left-2 top-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                  />
                </label>
                <Image src={item.url} alt={item.filename} fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div>
                  <p className="truncate text-sm font-medium text-slate-700">{item.filename}</p>
                  <p className="text-xs text-slate-400">
                    {item.usageCount > 0 ? `ใช้งานอยู่ ${item.usageCount} จุด` : "ยังไม่ได้ใช้"}
                  </p>
                </div>
                <FolderSelect
                  value={item.folderId ?? ""}
                  options={[
                    { value: "", label: "ยังไม่จัดหมวด" },
                    ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
                  ]}
                  onChange={(value) => void handleAssignFolder([item.id], value)}
                />
                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopy(item)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                    {copiedId === item.id ? "คัดลอกแล้ว" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete([item.id])}
                    aria-label="ลบไฟล์"
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">ไฟล์</th>
                <th className="px-4 py-3 font-medium">การใช้งาน</th>
                <th className="px-4 py-3 font-medium">โฟลเดอร์</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {media.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                        <Image src={item.url} alt={item.filename} fill className="object-cover" unoptimized />
                      </div>
                      <span className="max-w-xs truncate font-medium text-slate-700">{item.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.usageCount > 0 ? `ใช้งานอยู่ ${item.usageCount} จุด` : "ยังไม่ได้ใช้"}
                  </td>
                  <td className="px-4 py-3">
                    <FolderSelect
                      value={item.folderId ?? ""}
                      className="w-40"
                      options={[
                        { value: "", label: "ยังไม่จัดหมวด" },
                        ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
                      ]}
                      onChange={(value) => void handleAssignFolder([item.id], value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopy(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <CopyIcon className="h-3.5 w-3.5" />
                        {copiedId === item.id ? "คัดลอกแล้ว" : "Copy URL"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete([item.id])}
                        aria-label="ลบไฟล์"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} totalPages={totalPages} basePath="/admin/media" extraParams={{ q, folder: activeFolder !== "all" ? activeFolder : undefined }} />
    </div>
  );
}
