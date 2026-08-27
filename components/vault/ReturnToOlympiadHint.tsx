"use client";

import { ExternalLink } from "lucide-react";
import { openProviderPortal, RETURN_TO_OLYMPIAD_BOOKMARKLET } from "@/lib/return-to-olympiad";

export function ReturnToOlympiadHint({
  href,
  label = "Get API key",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="return-to-olympiad">
      <p className="return-to-olympiad-title">
        <strong>Keep this tab open</strong> while you get your key on the provider site.
      </p>
      <p className="hint">
        After copying your key, return here and paste it below. Pin this tab or use the bookmarklet on the provider
        page.
      </p>
      <div className="return-to-olympiad-actions">
        <button type="button" className="ghost-btn" onClick={() => openProviderPortal(href)}>
          <ExternalLink size={14} /> {label}
        </button>
        <a href={RETURN_TO_OLYMPIAD_BOOKMARKLET} className="ghost-btn return-to-olympiad-bookmarklet">
          Return to AI Olympiad
        </a>
      </div>
      <p className="hint return-to-olympiad-tip">
        Tip: drag <strong>Return to AI Olympiad</strong> to your bookmarks bar before opening the provider.
      </p>
    </div>
  );
}
