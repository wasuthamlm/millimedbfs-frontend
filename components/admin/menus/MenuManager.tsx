"use client";

import { useState, useTransition } from "react";
import { PlusIcon, PencilIcon, TrashIcon, GripIcon } from "@/components/ui/admin-icons";
import { ChevronDown } from "@/components/ui/icons";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";
import { cn } from "@/lib/utils";
import {
  createNavLink,
  updateNavLink,
  deleteNavLink,
  toggleNavLink,
  reorderNavLinks,
} from "@/app/admin/menus/actions";

export type MenuNode = {
  id: string;
  labelTh: string;
  labelEn: string | null;
  href: string;
  active: boolean;
  children: MenuNode[];
};

type FormState = { labelTh: string; labelEn: string; href: string };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

function emptyForm(): FormState {
  return { labelTh: "", labelEn: "", href: "" };
}

function countAll(nodes: MenuNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countAll(n.children), 0);
}

function maxDepth(nodes: MenuNode[], depth = 1): number {
  if (nodes.length === 0) return depth - 1;
  return Math.max(...nodes.map((n) => (n.children.length ? maxDepth(n.children, depth + 1) : depth)));
}

export function MenuManager({ initialTree }: { initialTree: MenuNode[] }) {
  const [tree, setTree] = useState<MenuNode[]>(initialTree);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(initialTree.map((n) => n.id)));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [addingParentId, setAddingParentId] = useState<string | null | "root">(null);
  const [addForm, setAddForm] = useState<FormState>(emptyForm());
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const findNode = (nodes: MenuNode[], id: string): MenuNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  };

  const findSiblings = (nodes: MenuNode[], parentId: string | null): MenuNode[] => {
    if (parentId === null) return nodes;
    const parent = findNode(nodes, parentId);
    return parent ? parent.children : [];
  };

  const updateTree = (updater: (nodes: MenuNode[]) => MenuNode[]) => {
    setTree((prev) => updater(prev));
  };

  const mapNode = (nodes: MenuNode[], id: string, fn: (n: MenuNode) => MenuNode): MenuNode[] =>
    nodes.map((n) => (n.id === id ? fn(n) : { ...n, children: mapNode(n.children, id, fn) }));

  const removeNode = (nodes: MenuNode[], id: string): MenuNode[] =>
    nodes.filter((n) => n.id !== id).map((n) => ({ ...n, children: removeNode(n.children, id) }));

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEdit = (node: MenuNode) => {
    setEditingId(node.id);
    setEditForm({ labelTh: node.labelTh, labelEn: node.labelEn ?? "", href: node.href });
    setError(null);
  };

  const submitEdit = (id: string) => {
    if (!editForm.labelTh.trim()) {
      setError("กรุณาระบุชื่อเมนู");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateNavLink(id, { ...editForm, parentId: null });
      if (res.error) {
        setError(res.error);
        return;
      }
      updateTree((nodes) =>
        mapNode(nodes, id, (n) => ({ ...n, labelTh: editForm.labelTh, labelEn: editForm.labelEn || null, href: editForm.href }))
      );
      setEditingId(null);
    });
  };

  const openAdd = (parentId: string | null | "root") => {
    setAddingParentId(parentId);
    setAddForm(emptyForm());
    setError(null);
    if (parentId && parentId !== "root") setExpanded((prev) => new Set(prev).add(parentId));
  };

  const submitAdd = () => {
    if (!addForm.labelTh.trim()) {
      setError("กรุณาระบุชื่อเมนู");
      return;
    }
    setError(null);
    const parentId = addingParentId === "root" ? null : addingParentId;
    startTransition(async () => {
      const res = await createNavLink({ ...addForm, parentId });
      if (res.error) {
        setError(res.error);
        return;
      }
      setAddingParentId(null);
      window.location.reload();
    });
  };

  const remove = (id: string) => {
    if (!confirm("ลบเมนูนี้? (เมนูย่อยจะถูกลบไปด้วย)")) return;
    startTransition(async () => {
      const res = await deleteNavLink(id);
      if (res.error) {
        setError(res.error);
        return;
      }
      updateTree((nodes) => removeNode(nodes, id));
    });
  };

  const toggle = (id: string, active: boolean) => {
    updateTree((nodes) => mapNode(nodes, id, (n) => ({ ...n, active })));
    startTransition(async () => {
      const res = await toggleNavLink(id, active);
      if (res.error) setError(res.error);
    });
  };

  const reorderSiblings = (draggedId: string, targetId: string, parentId: string | null) => {
    if (draggedId === targetId) return;
    const siblings = findSiblings(tree, parentId);
    const fromIndex = siblings.findIndex((n) => n.id === draggedId);
    const toIndex = siblings.findIndex((n) => n.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    if (parentId === null) {
      setTree(reordered);
    } else {
      updateTree((nodes) => mapNode(nodes, parentId, (n) => ({ ...n, children: reordered })));
    }

    startTransition(async () => {
      await reorderNavLinks(reordered.map((n) => n.id));
    });
  };

  const total = countAll(tree);
  const levels = Math.max(1, maxDepth(tree));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          {levels} ระดับ
        </span>
        <button
          type="button"
          onClick={() => openAdd("root")}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มเมนู
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {addingParentId === "root" && (
        <AddForm form={addForm} setForm={setAddForm} onSubmit={submitAdd} onCancel={() => setAddingParentId(null)} pending={pending} />
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">ชื่อเมนู</th>
              <th className="px-6 py-3 font-medium">URL</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  ยังไม่มีเมนู
                </td>
              </tr>
            )}
            {tree.map((node) => (
              <MenuRow
                key={node.id}
                node={node}
                depth={0}
                parentId={null}
                expanded={expanded}
                editingId={editingId}
                editForm={editForm}
                setEditForm={setEditForm}
                addingParentId={addingParentId}
                addForm={addForm}
                setAddForm={setAddForm}
                dragId={dragId}
                pending={pending}
                onToggleExpand={toggleExpand}
                onStartEdit={startEdit}
                onSubmitEdit={submitEdit}
                onCancelEdit={() => setEditingId(null)}
                onOpenAdd={openAdd}
                onSubmitAdd={submitAdd}
                onCancelAdd={() => setAddingParentId(null)}
                onRemove={remove}
                onToggle={toggle}
                onDragStart={setDragId}
                onDrop={(targetId, parentId) => {
                  if (dragId) reorderSiblings(dragId, targetId, parentId);
                  setDragId(null);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">รวมทั้งหมด {total} เมนู</p>
    </div>
  );
}

function AddForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  pending,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex-1 min-w-[140px]">
        <label className="mb-1 block text-xs text-slate-500">ชื่อเมนู (ไทย)</label>
        <input className={inputClass} value={form.labelTh} onChange={(e) => setForm({ ...form, labelTh: e.target.value })} />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="mb-1 block text-xs text-slate-500">ชื่อเมนู (อังกฤษ)</label>
        <input className={inputClass} value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} />
      </div>
      <div className="flex-1 min-w-[160px]">
        <label className="mb-1 block text-xs text-slate-500">URL (เว้นว่างได้ถ้าเป็นเมนูหลักที่มีแต่ดรอปดาวน์)</label>
        <input className={inputClass} value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/example" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onSubmit}
          className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-dark disabled:opacity-60"
        >
          บันทึก
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

function MenuRow({
  node,
  depth,
  parentId,
  expanded,
  editingId,
  editForm,
  setEditForm,
  addingParentId,
  addForm,
  setAddForm,
  dragId,
  pending,
  onToggleExpand,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
  onOpenAdd,
  onSubmitAdd,
  onCancelAdd,
  onRemove,
  onToggle,
  onDragStart,
  onDrop,
}: {
  node: MenuNode;
  depth: number;
  parentId: string | null;
  expanded: Set<string>;
  editingId: string | null;
  editForm: FormState;
  setEditForm: (f: FormState) => void;
  addingParentId: string | null | "root";
  addForm: FormState;
  setAddForm: (f: FormState) => void;
  dragId: string | null;
  pending: boolean;
  onToggleExpand: (id: string) => void;
  onStartEdit: (n: MenuNode) => void;
  onSubmitEdit: (id: string) => void;
  onCancelEdit: () => void;
  onOpenAdd: (parentId: string | null | "root") => void;
  onSubmitAdd: () => void;
  onCancelAdd: () => void;
  onRemove: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string, parentId: string | null) => void;
}) {
  const isEditing = editingId === node.id;
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <>
      <tr
        draggable={!isEditing}
        onDragStart={() => onDragStart(node.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDrop(node.id, parentId)}
        className={cn("border-b border-slate-50 last:border-0", dragId === node.id && "opacity-50", !node.active && "opacity-50")}
      >
        {isEditing ? (
          <>
            <td className="px-4 py-3" style={{ paddingLeft: 16 + depth * 24 }}>
              <input className={inputClass} value={editForm.labelTh} onChange={(e) => setEditForm({ ...editForm, labelTh: e.target.value })} placeholder="ชื่อไทย" />
              <input
                className={cn(inputClass, "mt-1")}
                value={editForm.labelEn}
                onChange={(e) => setEditForm({ ...editForm, labelEn: e.target.value })}
                placeholder="ชื่ออังกฤษ"
              />
            </td>
            <td className="px-6 py-3">
              <input className={inputClass} value={editForm.href} onChange={(e) => setEditForm({ ...editForm, href: e.target.value })} />
            </td>
            <td className="px-6 py-3" />
            <td className="px-6 py-3">
              <div className="flex items-center justify-end gap-2">
                <button type="button" disabled={pending} onClick={() => onSubmitEdit(node.id)} className="rounded-md px-2 py-1 text-xs font-medium text-brand-navy hover:bg-slate-100">
                  บันทึก
                </button>
                <button type="button" onClick={onCancelEdit} className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                  ยกเลิก
                </button>
              </div>
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-3.5" style={{ paddingLeft: 16 + depth * 24 }}>
              <div className="flex items-center gap-2">
                <GripIcon className="h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                {hasChildren ? (
                  <button type="button" onClick={() => onToggleExpand(node.id)} className="shrink-0 text-slate-400 hover:text-slate-600">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                <div>
                  <span className="font-medium text-slate-800">{node.labelTh}</span>
                  {node.labelEn && <span className="ml-1.5 text-xs text-slate-400">{node.labelEn}</span>}
                </div>
                {hasChildren && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{node.children.length}</span>
                )}
              </div>
            </td>
            <td className="px-6 py-3.5 font-mono text-xs text-slate-400">{node.href}</td>
            <td className="px-6 py-3.5">
              <StatusSelectPill
                value={node.active ? "1" : "0"}
                options={[
                  { value: "1", label: "เปิดใช้งาน" },
                  { value: "0", label: "ปิดใช้งาน" },
                ]}
                colorClass={node.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}
                ariaLabel={`สถานะ ${node.labelTh}`}
                onChange={(v) => onToggle(node.id, v === "1")}
              />
            </td>
            <td className="px-6 py-3.5">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onOpenAdd(node.id)}
                  aria-label="เพิ่มเมนูย่อย"
                  title="เพิ่มเมนูย่อย"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onStartEdit(node)}
                  aria-label="แก้ไข"
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(node.id)}
                  aria-label="ลบ"
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </td>
          </>
        )}
      </tr>

      {addingParentId === node.id && (
        <tr>
          <td colSpan={4} className="px-4 py-3" style={{ paddingLeft: 16 + (depth + 1) * 24 }}>
            <AddForm form={addForm} setForm={setAddForm} onSubmit={onSubmitAdd} onCancel={onCancelAdd} pending={pending} />
          </td>
        </tr>
      )}

      {isExpanded &&
        node.children.map((child) => (
          <MenuRow
            key={child.id}
            node={child}
            depth={depth + 1}
            parentId={node.id}
            expanded={expanded}
            editingId={editingId}
            editForm={editForm}
            setEditForm={setEditForm}
            addingParentId={addingParentId}
            addForm={addForm}
            setAddForm={setAddForm}
            dragId={dragId}
            pending={pending}
            onToggleExpand={onToggleExpand}
            onStartEdit={onStartEdit}
            onSubmitEdit={onSubmitEdit}
            onCancelEdit={onCancelEdit}
            onOpenAdd={onOpenAdd}
            onSubmitAdd={onSubmitAdd}
            onCancelAdd={onCancelAdd}
            onRemove={onRemove}
            onToggle={onToggle}
            onDragStart={onDragStart}
            onDrop={onDrop}
          />
        ))}
    </>
  );
}
