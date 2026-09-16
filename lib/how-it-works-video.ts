export type VideoEmbed =
  | { kind: "iframe"; src: string; title: string }
  | { kind: "video"; src: string };

/** Resolve NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL to an embeddable source (YouTube, Vimeo, or direct file). */
export function resolveHowItWorksVideo(raw: string | undefined): VideoEmbed | null {
  const url = raw?.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (!id) return null;
      return {
        kind: "iframe",
        src: `https://www.youtube.com/embed/${id}`,
        title: "How AI Olympiad works",
      };
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v") ?? parsed.pathname.split("/").pop();
      if (!id || id === "watch") return null;
      return {
        kind: "iframe",
        src: `https://www.youtube.com/embed/${id}`,
        title: "How AI Olympiad works",
      };
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const id = host === "player.vimeo.com" ? segments[0] : segments.pop();
      if (!id) return null;
      return {
        kind: "iframe",
        src: `https://player.vimeo.com/video/${id}`,
        title: "How AI Olympiad works",
      };
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(parsed.pathname)) {
      return { kind: "video", src: url };
    }
  } catch {
    return null;
  }

  return null;
}

export const HOW_IT_WORKS_VIDEO = resolveHowItWorksVideo(process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL);
