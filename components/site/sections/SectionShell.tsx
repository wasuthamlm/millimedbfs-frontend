import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DeviceVisibility, SectionConfig } from "@/lib/sections";

// Wrapper every page-builder block renders inside: device visibility,
// background (colour or image + overlay), vertical padding and max width
// (ported from the legacy SectionShell + SectionBackground).

const PADDING: Record<string, string> = { none: "py-0", sm: "py-6", md: "py-12", lg: "py-16", xl: "py-24" };
const MAX_WIDTH: Record<string, string> = { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-none" };
const ALIGN: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };

export function visibilityClass(v: DeviceVisibility) {
  return [v.mobile ? "block" : "hidden", v.tablet ? "md:block" : "md:hidden", v.desktop ? "lg:block" : "lg:hidden"].join(" ");
}

export function SectionShell({
  config,
  visibility,
  children,
  defaultMaxWidth = "lg",
  className,
}: {
  config: SectionConfig;
  visibility: DeviceVisibility;
  children: ReactNode;
  defaultMaxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}) {
  const bg = config.background;
  const spacing = config.spacing ?? {};
  const light = bg?.textColor === "light";
  const style: React.CSSProperties = {};
  if (bg?.type === "color" && bg.color) style.backgroundColor = bg.color;
  if (bg?.type === "image" && bg.imageUrl) {
    style.backgroundImage = `url("${bg.imageUrl.replace(/"/g, "%22")}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }

  return (
    <section
      id={config.anchorId || undefined}
      style={style}
      className={cn("relative scroll-mt-24", visibilityClass(visibility), light && "text-white", className)}
    >
      {bg?.type === "image" && bg.imageUrl && (bg.overlay ?? 0) > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: Math.min(80, bg.overlay ?? 0) / 100 }} aria-hidden="true" />
      )}
      <div
        className={cn(
          "relative mx-auto px-4 sm:px-6",
          PADDING[spacing.paddingY ?? "md"],
          MAX_WIDTH[spacing.maxWidth ?? defaultMaxWidth],
          ALIGN[spacing.textAlign ?? "left"],
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionTitle({ title, light }: { title: string; light?: boolean }) {
  if (!title) return null;
  return <h2 className={cn("mb-6 text-2xl font-bold sm:text-3xl", light ? "text-white" : "text-slate-900")}>{title}</h2>;
}

/** Rich-text HTML. The public renderer sanitizes before passing it in. */
export function RichText({ html, className }: { html?: string; className?: string }) {
  if (!html) return null;
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return <p className={cn("whitespace-pre-line leading-relaxed", className)}>{html}</p>;
  }
  return <div className={cn("prose prose-slate max-w-none prose-a:text-brand-navy", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
