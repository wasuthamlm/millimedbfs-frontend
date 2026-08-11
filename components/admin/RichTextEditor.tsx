"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  { label: "Sans Serif", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-brand-navy/10 text-brand-navy",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onUploadImage }: { editor: Editor; onUploadImage: (file: File) => Promise<void> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : "0";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
      <select
        value={headingValue}
        onChange={(e) => {
          const level = Number(e.target.value);
          if (level === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
        }}
        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
      >
        <option value="0">Normal</option>
        <option value="1">หัวข้อ 1</option>
        <option value="2">หัวข้อ 2</option>
        <option value="3">หัวข้อ 3</option>
      </select>

      <select
        defaultValue=""
        onChange={(e) => {
          const value = e.target.value;
          if (value) editor.chain().focus().setFontFamily(value).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton label="ตัวหนา" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton label="ตัวเอียง" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton label="ขีดเส้นใต้" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton label="ขีดฆ่า" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>

      <label title="สีตัวอักษร" className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-slate-100">
        <span className="text-sm font-bold text-slate-600">A</span>
        <input
          type="color"
          className="h-0 w-0 opacity-0"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>
      <label title="ไฮไลต์" className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-slate-100">
        <span className="rounded bg-yellow-200 px-0.5 text-sm font-bold text-slate-800">A</span>
        <input
          type="color"
          className="h-0 w-0 opacity-0"
          onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
        />
      </label>

      <ToolbarButton label="ตัวยก" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
        x<sup>2</sup>
      </ToolbarButton>
      <ToolbarButton label="ตัวห้อย" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
        x<sub>2</sub>
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton label="ชิดซ้าย" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        ≡
      </ToolbarButton>
      <ToolbarButton label="กึ่งกลาง" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        ≣
      </ToolbarButton>
      <ToolbarButton label="ชิดขวา" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        ≡
      </ToolbarButton>

      <ToolbarButton label="รายการลำดับเลข" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </ToolbarButton>
      <ToolbarButton label="รายการหัวข้อย่อย" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        label="คำพูดอ้างอิง"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &rdquo;
      </ToolbarButton>
      <ToolbarButton label="โค้ด" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        {"</>"}
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        label="ลิงก์"
        active={editor.isActive("link")}
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("ใส่ URL ลิงก์", previousUrl ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        🔗
      </ToolbarButton>
      <ToolbarButton label="แทรกรูปภาพ" onClick={() => fileInputRef.current?.click()}>
        🖼
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onUploadImage(file);
          e.target.value = "";
        }}
      />

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton label="ล้างการจัดรูปแบบ" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        Tx
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none px-3 py-2 min-h-[10rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const handleUploadImage = async (file: File) => {
    if (!editor) return;
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "อัปโหลดไม่สำเร็จ");
        return;
      }
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch {
      setUploadError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (!editor) {
    return (
      <div className={cn("w-full rounded-lg border border-slate-200 bg-white", className)}>
        <div className="min-h-[12rem] animate-pulse bg-slate-50" />
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <Toolbar editor={editor} onUploadImage={handleUploadImage} />
      <EditorContent editor={editor} />
      {uploadError && <p className="px-3 pb-2 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}
