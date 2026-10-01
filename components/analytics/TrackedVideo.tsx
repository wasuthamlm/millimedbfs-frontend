"use client";

import { canonicalPageId, pushDataLayerEvent } from "@/lib/analytics/dataLayerEvents";

/**
 * Uploaded video with truthful `video_start` / `video_complete` (≥95%) events.
 * YouTube/Vimeo iframes expose no playback state and are intentionally not tracked.
 */
export function TrackedVideo({ src, className }: { src: string; className?: string }) {
  const key = () => `${canonicalPageId()}|${src}`;
  return (
    <video
      src={src}
      controls
      preload="metadata"
      playsInline
      className={className}
      onPlaying={() => pushDataLayerEvent("video_start", { dedupeKey: key(), params: { page_id: canonicalPageId() } })}
      onTimeUpdate={(e) => {
        const el = e.currentTarget;
        if (el.duration && Number.isFinite(el.duration) && el.currentTime / el.duration >= 0.95) {
          pushDataLayerEvent("video_complete", { dedupeKey: key(), params: { page_id: canonicalPageId() } });
        }
      }}
    />
  );
}
