// Block-based footer layout (ported from the legacy src/lib/footerBlocks.js +
// footer_config). Stored in SiteConfig "footer_blocks". When no block is
// configured the footer falls back to the FooterColumn/FooterLink layout.

export type FooterAlign = "left" | "center" | "right";

type BlockBase = { id: string; alignment: FooterAlign; visible: boolean; titleTh: string; titleEn: string };

export type FooterBlock =
  | (BlockBase & { type: "logo_text"; logoUrl: string; textTh: string; textEn: string })
  | (BlockBase & { type: "links"; items: { labelTh: string; labelEn: string; url: string }[] })
  | (BlockBase & { type: "contact"; showSocial: boolean })
  | (BlockBase & { type: "social"; iconSize: "sm" | "md" | "lg" })
  | (BlockBase & { type: "custom_text"; textTh: string; textEn: string });

export type FooterBlockType = FooterBlock["type"];

export type FooterBlocksConfig = { columns: { id: string; blocks: FooterBlock[] }[] };

export const FOOTER_BLOCK_TYPES: { type: FooterBlockType; label: string }[] = [
  { type: "logo_text", label: "โลโก้ & คำอธิบาย" },
  { type: "links", label: "รายการลิงก์ด่วน" },
  { type: "contact", label: "ข้อมูลติดต่อ" },
  { type: "social", label: "ไอคอนโซเชียล" },
  { type: "custom_text", label: "ข้อความอิสระ" },
];

export const EMPTY_FOOTER_BLOCKS: FooterBlocksConfig = {
  columns: [
    { id: "col-1", blocks: [] },
    { id: "col-2", blocks: [] },
    { id: "col-3", blocks: [] },
  ],
};

export function createFooterBlock(type: FooterBlockType): FooterBlock {
  const base: BlockBase = { id: `b-${crypto.randomUUID().slice(0, 8)}`, alignment: "left", visible: true, titleTh: "", titleEn: "" };
  switch (type) {
    case "logo_text":
      return { ...base, type, logoUrl: "", textTh: "", textEn: "" };
    case "links":
      return { ...base, type, titleTh: "ลิงก์ด่วน", titleEn: "Quick Links", items: [{ labelTh: "หน้าหลัก", labelEn: "Home", url: "/" }] };
    case "contact":
      return { ...base, type, titleTh: "ติดต่อเรา", titleEn: "Contact Us", showSocial: false };
    case "social":
      return { ...base, type, titleTh: "ติดตามเรา", titleEn: "Follow Us", iconSize: "md" };
    case "custom_text":
      return { ...base, type, titleTh: "หัวข้อ", titleEn: "Heading", textTh: "", textEn: "" };
  }
}

export const hasFooterBlocks = (config: FooterBlocksConfig | null | undefined) =>
  !!config?.columns?.some((c) => c.blocks.some((b) => b.visible));
