"use client";

import { useState, useTransition } from "react";
import { PlusIcon, PencilIcon, TrashIcon, GripIcon } from "@/components/ui/admin-icons";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  nameTh: string;
  nameEn: string | null;
  slug: string;
  active: boolean;
  parentId: string | null;
  itemCount: number;
};

export type CategoryFormInput = {
  nameTh: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
};

type ActionResult = { error?: string };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

function emptyForm(parentId: string | null = null): CategoryFormInput {
  return { nameTh: "", nameEn: "", slug: "", parentId };
}

export function CategoryManager({
  itemCountLabel,
  hasHierarchy,
  initialCategories,
  onCreate,
  onUpdate,
  onDelete,
  onToggle,
  onReorder,
}: {
  itemCountLabel: string;
  hasHierarchy: boolean;
  initialCategories: CategoryRow[];
  onCreate: (input: CategoryFormInput) => Promise<ActionResult>;
  onUpdate: (id: string, input: CategoryFormInput) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onToggle: (id: string, active: boolean) => Promise<ActionResult>;
  onReorder?: (ids: string[]) => Promise<ActionResult>;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<CategoryFormInput>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormInput>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const topLevel = categories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);
  const ordered = hasHierarchy
    ? topLevel.flatMap((parent) => [parent, ...childrenOf(parent.id)])
    : categories;

  const parentOptions = categories.filter((c) => !c.parentId);

  const openAdd = (parentId: string | null = null) => {
    setAdding(true);
    setAddForm(emptyForm(parentId));
    setError(null);
  };

  const submitAdd = () => {
    setError(null);
    if (!addForm.nameTh.trim()) {
      setError("กรุณาระบุชื่อไทย");
      return;
    }
    const input = { ...addForm, slug: addForm.slug.trim() || slugify(addForm.nameTh) };
    startTransition(async () => {
      const res = await onCreate(input);
      if (res.error) {
        setError(res.error);
        return;
      }
      setAdding(false);
      setAddForm(emptyForm());
      window.location.reload();
    });
  };

  const startEdit = (row: CategoryRow) => {
    setEditingId(row.id);
    setEditForm({ nameTh: row.nameTh, nameEn: row.nameEn ?? "", slug: row.slug, parentId: row.parentId });
    setError(null);
  };

  const submitEdit = (id: string) => {
    setError(null);
    if (!editForm.nameTh.trim()) {
      setError("กรุณาระบุชื่อไทย");
      return;
    }
    startTransition(async () => {
      const res = await onUpdate(id, editForm);
      if (res.error) {
        setError(res.error);
        return;
      }
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, nameTh: editForm.nameTh, nameEn: editForm.nameEn || null, slug: editForm.slug, parentId: editForm.parentId }
            : c
        )
      );
      setEditingId(null);
    });
  };

  const remove = (id: string) => {
    if (!confirm("ลบหมวดหมู่นี้?")) return;
    startTransition(async () => {
      const res = await onDelete(id);
      if (res.error) {
        setError(res.error);
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    });
  };

  const toggle = (id: string, active: boolean) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    startTransition(async () => {
      const res = await onToggle(id, active);
      if (res.error) {
        setError(res.error);
      }
    });
  };

  const reorderWithinGroup = (draggedId: string, targetId: string, groupParentId: string | null) => {
    if (!onReorder || draggedId === targetId) return;
    const group = categories.filter((c) => c.parentId === groupParentId);
    const fromIndex = group.findIndex((c) => c.id === draggedId);
    const toIndex = group.findIndex((c) => c.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reorderedGroup = [...group];
    const [moved] = reorderedGroup.splice(fromIndex, 1);
    reorderedGroup.splice(toIndex, 0, moved);

    setCategories((prev) => {
      const others = prev.filter((c) => c.parentId !== groupParentId);
      return hasHierarchy && groupParentId === null
        ? [...reorderedGroup, ...others]
        : [...others, ...reorderedGroup];
    });

    startTransition(async () => {
      await onReorder(reorderedGroup.map((c) => c.id));
    });
  };

  const topLevelIndexById = new Map<string, number>();
  {
    let counter = 0;
    for (const row of ordered) {
      if (!(hasHierarchy && !!row.parentId)) {
        counter += 1;
        topLevelIndexById.set(row.id, counter);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => openAdd(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {adding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs text-slate-500">ชื่อไทย</label>
            <input
              className={inputClass}
              value={addForm.nameTh}
              onChange={(e) => setAddForm((f) => ({ ...f, nameTh: e.target.value }))}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs text-slate-500">ชื่ออังกฤษ</label>
            <input
              className={inputClass}
              value={addForm.nameEn}
              onChange={(e) => setAddForm((f) => ({ ...f, nameEn: e.target.value }))}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs text-slate-500">Slug (เว้นว่างให้สร้างอัตโนมัติ)</label>
            <input
              className={inputClass}
              value={addForm.slug}
              onChange={(e) => setAddForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
          {hasHierarchy && (
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-xs text-slate-500">หมวดหมู่แม่</label>
              <select
                className={inputClass}
                value={addForm.parentId ?? ""}
                onChange={(e) => setAddForm((f) => ({ ...f, parentId: e.target.value || null }))}
              >
                <option value="">— ไม่มี (หมวดหมู่หลัก) —</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameTh}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={submitAdd}
            className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-60"
          >
            บันทึก
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="w-14 px-4 py-3 font-medium">#</th>
              <th className="px-2 py-3 font-medium">ชื่อไทย</th>
              <th className="px-6 py-3 font-medium">ชื่ออังกฤษ</th>
              <th className="px-6 py-3 font-medium">SLUG</th>
              <th className="px-6 py-3 font-medium">{itemCountLabel}</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row) => {
              const isEditing = editingId === row.id;
              const isChild = hasHierarchy && !!row.parentId;
              const groupParentId = isChild ? row.parentId : null;
              const groupIndex = isChild
                ? childrenOf(row.parentId as string).findIndex((c) => c.id === row.id) + 1
                : (topLevelIndexById.get(row.id) as number);

              return (
                <tr
                  key={row.id}
                  draggable={!!onReorder && !isEditing}
                  onDragStart={() => setDragId(row.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) reorderWithinGroup(dragId, row.id, groupParentId);
                    setDragId(null);
                  }}
                  className={cn(
                    "border-b border-slate-50 last:border-0",
                    dragId === row.id && "opacity-50"
                  )}
                >
                  {isEditing ? (
                    <>
                      <td className="px-4 py-3 text-slate-300">{groupIndex}</td>
                      <td className="px-2 py-3">
                        <input
                          className={inputClass}
                          value={editForm.nameTh}
                          onChange={(e) => setEditForm((f) => ({ ...f, nameTh: e.target.value }))}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          className={inputClass}
                          value={editForm.nameEn}
                          onChange={(e) => setEditForm((f) => ({ ...f, nameEn: e.target.value }))}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          className={inputClass}
                          value={editForm.slug}
                          onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                        />
                      </td>
                      <td className="px-6 py-3 text-slate-400">{row.itemCount}</td>
                      <td className="px-6 py-3" />
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => submitEdit(row.id)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-brand-navy hover:bg-slate-100"
                          >
                            บันทึก
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          {onReorder && (
                            <GripIcon className="h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                          )}
                          {groupIndex}
                        </div>
                      </td>
                      <td className={cn("px-2 py-3.5 font-medium text-slate-800", isChild && "pl-8")}>
                        {isChild && <span className="mr-1 text-slate-300">{"›"}</span>}
                        {row.nameTh}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{row.nameEn || "—"}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-400">{row.slug}</td>
                      <td className="px-6 py-3.5 text-slate-600">{row.itemCount}</td>
                      <td className="px-6 py-3.5">
                        <StatusSelectPill
                          value={row.active ? "1" : "0"}
                          options={[
                            { value: "1", label: "เผยแพร่" },
                            { value: "0", label: "ซ่อน" },
                          ]}
                          colorClass={row.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}
                          ariaLabel={`สถานะ ${row.nameTh}`}
                          onChange={(v) => toggle(row.id, v === "1")}
                        />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {hasHierarchy && !isChild && (
                            <button
                              type="button"
                              onClick={() => openAdd(row.id)}
                              aria-label="เพิ่มหมวดหมู่ย่อย"
                              title="เพิ่มหมวดหมู่ย่อย"
                              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                            aria-label="แก้ไข"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(row.id)}
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                            aria-label="ลบ"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {ordered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  ยังไม่มีหมวดหมู่
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
