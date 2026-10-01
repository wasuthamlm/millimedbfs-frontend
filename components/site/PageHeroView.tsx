import { buildHeroLayers, type PageHeroConfig } from "@/lib/page-hero";

/**
 * The page-header band itself (no data fetching) — used by the public
 * <PageHero> and the live preview in Admin → จัดการหัวข้อหน้า.
 */
export function PageHeroView({
  config,
  title,
  subtitle,
  align,
  hidden,
}: {
  config: PageHeroConfig;
  title: string;
  subtitle?: string | null;
  /** Per-page override */
  align?: string | null;
  /** Per-page "none" */
  hidden?: boolean;
}) {
  if (config.mode === "none" || hidden) return null;
  const { outerStyle, bandStyle, imageStyle, overlayStyle, patternStyle, fadeStyle, titleColor, subtitleColor } = buildHeroLayers(config);
  const centered = (align || config.align || "center") === "center";

  return (
    <div style={outerStyle}>
      <div className="relative flex items-center overflow-hidden" style={bandStyle}>
        {imageStyle && <div className="absolute inset-0" style={imageStyle} aria-hidden="true" />}
        {overlayStyle && <div className="absolute inset-0" style={overlayStyle} aria-hidden="true" />}
        {patternStyle && <div className="absolute inset-0" style={patternStyle} aria-hidden="true" />}
        {fadeStyle && <div className="pointer-events-none absolute inset-0" style={fadeStyle} aria-hidden="true" />}
        <div className={`relative mx-auto w-full max-w-5xl ${centered ? "text-center" : "text-left"}`}>
          <h1 className="mb-1 break-words text-2xl font-bold md:mb-2 md:text-4xl" style={{ color: titleColor }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm" style={{ color: subtitleColor || titleColor, opacity: subtitleColor ? 1 : 0.6 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
