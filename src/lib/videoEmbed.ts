// Helpers to convert pasted video URLs / HTML into a normalized embed URL.

const DIRECT_VIDEO_FILE_PATTERN = /\.(mp4|webm|ogv|mov|mkv|m4v)(\?|$)/i;
const HTML_EMBED_PATTERN = /\.(html?)(\?|$)/i;

const YT_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"];
const VIMEO_HOSTS = ["vimeo.com", "www.vimeo.com", "player.vimeo.com"];

export type EmbedKind = "youtube" | "vimeo" | "iframe" | "file";

export interface EmbedInfo {
  kind: EmbedKind;
  url: string; // normalized URL (embed URL for YT/Vimeo, file URL for file)
}

/** Extract first src="..." from an <iframe ...> snippet. */
const extractIframeSrc = (input: string): string | null => {
  const match = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
};

const parseUrl = (raw: string): URL | null => {
  try {
    return new URL(raw.startsWith("//") ? `https:${raw}` : raw);
  } catch {
    return null;
  }
};

const youtubeEmbed = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host.endsWith("youtube.com")) {
    if (url.pathname.startsWith("/embed/")) return url.toString();
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  }
  return null;
};

const vimeoEmbed = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "player.vimeo.com") return url.toString();
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
  }
  return null;
};

/** Parse a pasted URL or <iframe> HTML snippet into a normalized embed URL. */
export const parseVideoEmbed = (input: string): EmbedInfo | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it's an iframe HTML snippet, pull the src out.
  const iframeSrc = trimmed.toLowerCase().includes("<iframe") ? extractIframeSrc(trimmed) : null;
  const candidate = iframeSrc ?? trimmed;

  const url = parseUrl(candidate);
  if (!url) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");

  if (YT_HOSTS.includes(host) || YT_HOSTS.includes(url.hostname)) {
    const embed = youtubeEmbed(url);
    if (embed) return { kind: "youtube", url: embed };
  }
  if (VIMEO_HOSTS.includes(host) || VIMEO_HOSTS.includes(url.hostname)) {
    const embed = vimeoEmbed(url);
    if (embed) return { kind: "vimeo", url: embed };
  }

  // Direct video file by extension
  if (DIRECT_VIDEO_FILE_PATTERN.test(url.pathname)) {
    return { kind: "file", url: url.toString() };
  }

  if (HTML_EMBED_PATTERN.test(url.pathname)) {
    return { kind: "iframe", url: url.toString() };
  }

  // Fallback: treat any other https URL (or iframe src) as a generic iframe embed
  return { kind: "iframe", url: url.toString() };
};

/** True if this URL should be rendered via <iframe> rather than <video>. */
export const isEmbedUrl = (src: string): boolean => {
  const url = parseUrl(src);
  if (!url) return false;
  const host = url.hostname.replace(/^www\./, "");
  if (host.endsWith("youtube.com") || host === "youtu.be") return true;
  if (host.endsWith("vimeo.com")) return true;
  if (DIRECT_VIDEO_FILE_PATTERN.test(url.pathname)) return false;
  if (HTML_EMBED_PATTERN.test(url.pathname)) return true;
  // Anything else that's an http(s) URL but not a recognised file -> iframe
  return url.protocol === "http:" || url.protocol === "https:";
};
