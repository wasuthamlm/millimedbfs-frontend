import Image from "next/image";
import { cn } from "@/lib/utils";
import { FileIcon, VideoIcon } from "@/components/ui/admin-icons";

/** Thumbnail for any media-library file: images render, video/PDF get an icon tile. */
export function MediaPreview({
  url,
  mimeType,
  alt,
  className,
  controls = false,
}: {
  url: string;
  mimeType: string;
  alt: string;
  className?: string;
  controls?: boolean;
}) {
  if (mimeType.startsWith("video/")) {
    return controls ? (
      <video src={url} controls className={cn("h-full w-full bg-black object-contain", className)} />
    ) : (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-800 text-white/80", className)}>
        <VideoIcon className="h-8 w-8" />
        <span className="text-[10px] uppercase tracking-wide">video</span>
      </div>
    );
  }
  if (!mimeType.startsWith("image/")) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-1 bg-red-50 text-red-500", className)}>
        <FileIcon className="h-8 w-8" />
        <span className="text-[10px] uppercase tracking-wide">{mimeType === "application/pdf" ? "pdf" : "file"}</span>
      </div>
    );
  }
  return <Image src={url} alt={alt} fill className={cn("object-cover", className)} unoptimized />;
}
