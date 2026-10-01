// Turns a pasted video link into something playable (ported from the legacy
// src/lib/videoEmbed.js). Only YouTube and Vimeo are embedded — they're the
// only video hosts allowed by the CSP frame-src in next.config.ts.

export type VideoSource = { kind: "iframe"; src: string } | { kind: "file"; src: string } | null;

/** YouTube video id from any YouTube link (watch / youtu.be / shorts / live / embed), else null. */
export function youtubeId(rawUrl: string | null | undefined): string | null {
  const url = String(rawUrl || "").trim();
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|v\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  return m ? m[1] : null;
}

export function videoSource(rawUrl: string | null | undefined): VideoSource {
  const url = String(rawUrl || "").trim();
  if (!/^https:\/\//i.test(url)) return null;

  const yt = youtubeId(url);
  if (yt) {
    const start = url.match(/[?&](?:t|start)=(\d+)/);
    return { kind: "iframe", src: `https://www.youtube.com/embed/${yt}${start ? `?start=${start[1]}` : ""}` };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url)) return { kind: "file", src: url };
  return null;
}

/** Thumbnail for a YouTube link (used as a poster/fallback), else null. */
export function youtubeThumbnail(rawUrl: string | null | undefined): string | null {
  const id = youtubeId(rawUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
