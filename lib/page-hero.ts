import type { CSSProperties } from "react";

// Global page-header band shown at the top of every public page (ported from
// the legacy src/lib/pageHeroConfig.js). Configured once in Admin → หน้าเว็บ →
// จัดการหัวข้อหน้า; a page can hide it or override the alignment.

export type HeroMode = "solid" | "gradient" | "pattern" | "image" | "none";

export type PageHeroConfig = {
  mode: HeroMode;
  bgColor: string;
  bgColorTo: string;
  pattern: "dots" | "grid" | "diagonal" | "waves";
  patternColor: string;
  patternOpacity: number;
  imageUrl: string;
  overlayColor: string;
  overlayOpacity: number;
  fadeEdge: "none" | "top" | "bottom" | "both";
  fadeColor: string;
  titleColor: string;
  subtitleColor: string;
  align: "center" | "left";
  minHeight: number;
  paddingY: number;
  paddingX: number;
  marginTop: number;
  marginBottom: number;
};

export const HERO_DEFAULTS: PageHeroConfig = {
  mode: "solid",
  bgColor: "#DDE9F8",
  bgColorTo: "#FFFFFF",
  pattern: "dots",
  patternColor: "#FFFFFF",
  patternOpacity: 40,
  imageUrl: "",
  overlayColor: "#000000",
  overlayOpacity: 35,
  fadeEdge: "none",
  fadeColor: "#FFFFFF",
  titleColor: "#121212",
  subtitleColor: "",
  align: "center",
  minHeight: 150,
  paddingY: 32,
  paddingX: 16,
  marginTop: 0,
  marginBottom: 0,
};

export const HERO_MODES: { value: HeroMode; label: string }[] = [
  { value: "solid", label: "สีพื้นทึบ (Solid)" },
  { value: "gradient", label: "ไล่สี (Gradient)" },
  { value: "pattern", label: "ลวดลาย (Pattern)" },
  { value: "image", label: "รูปภาพ (Image)" },
  { value: "none", label: "ไม่แสดง (Hidden)" },
];

// Colours end up in inline CSS — only accept plain hex values.
const hex = (v: string, fallback: string) => (/^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fallback);

function patternImage(cfg: PageHeroConfig): CSSProperties {
  const c = hex(cfg.patternColor, "#FFFFFF");
  switch (cfg.pattern) {
    case "grid":
      return { backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, backgroundSize: "24px 24px" };
    case "diagonal":
      return { backgroundImage: `repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 12px)` };
    case "waves":
      return { backgroundImage: `repeating-radial-gradient(circle at 0 100%, transparent 0 10px, ${c} 10px 12px)`, backgroundSize: "32px 32px" };
    default:
      return { backgroundImage: `radial-gradient(circle, ${c} 1.6px, transparent 1.7px)`, backgroundSize: "16px 16px" };
  }
}

function fadeGradient(cfg: PageHeroConfig) {
  const c = hex(cfg.fadeColor, "#FFFFFF");
  if (cfg.fadeEdge === "top") return `linear-gradient(to bottom, ${c}, transparent 40%)`;
  if (cfg.fadeEdge === "bottom") return `linear-gradient(to top, ${c}, transparent 40%)`;
  return `linear-gradient(to bottom, ${c}, transparent 35%, transparent 65%, ${c})`;
}

const px = (n: number) => `${Math.max(0, Math.min(600, Number(n) || 0))}px`;

export function buildHeroLayers(cfg: PageHeroConfig) {
  const bg = hex(cfg.bgColor, HERO_DEFAULTS.bgColor);
  const outerStyle: CSSProperties = { marginTop: px(cfg.marginTop), marginBottom: px(cfg.marginBottom) };
  const bandStyle: CSSProperties = {
    minHeight: px(cfg.minHeight),
    paddingTop: px(cfg.paddingY),
    paddingBottom: px(cfg.paddingY),
    paddingLeft: px(cfg.paddingX),
    paddingRight: px(cfg.paddingX),
    ...(cfg.mode === "gradient"
      ? { backgroundImage: `linear-gradient(to bottom, ${bg}, ${hex(cfg.bgColorTo, "#FFFFFF")})` }
      : { backgroundColor: bg }),
  };
  const imageStyle: CSSProperties | null =
    cfg.mode === "image" && /^https:\/\//.test(cfg.imageUrl)
      ? { backgroundImage: `url("${cfg.imageUrl.replace(/["\\]/g, "")}")`, backgroundSize: "cover", backgroundPosition: "center" }
      : null;
  const overlayStyle: CSSProperties | null =
    cfg.mode === "image" ? { backgroundColor: hex(cfg.overlayColor, "#000000"), opacity: (Number(cfg.overlayOpacity) || 0) / 100 } : null;
  const patternStyle: CSSProperties | null =
    cfg.mode === "pattern" ? { ...patternImage(cfg), opacity: (Number(cfg.patternOpacity) || 0) / 100 } : null;
  const fadeStyle: CSSProperties | null = cfg.fadeEdge !== "none" ? { backgroundImage: fadeGradient(cfg) } : null;
  return {
    outerStyle,
    bandStyle,
    imageStyle,
    overlayStyle,
    patternStyle,
    fadeStyle,
    titleColor: hex(cfg.titleColor, "#121212"),
    subtitleColor: cfg.subtitleColor ? hex(cfg.subtitleColor, "") : "",
  };
}
