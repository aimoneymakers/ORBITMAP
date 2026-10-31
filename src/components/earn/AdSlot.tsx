"use client";

import { useEffect, useRef } from "react";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Place = "header" | "inline" | "footer";

// A manual AdSense slot + (optional) any other ad network via sandboxed frame.
export default function AdSlot({ place }: { place: Place }) {
  const { monetization } = useSiteSettings();
  const a = monetization.adsense;
  const slotId = place === "header" ? a.headerSlot : place === "inline" ? a.inlineSlot : a.footerSlot;
  const pushed = useRef(false);

  const showAdsense = a.enabled && !!a.publisherId && !!slotId;

  useEffect(() => {
    if (!showAdsense || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers / not approved yet — ignore */
    }
  }, [showAdsense]);

  // Custom ad code shows only in the "inline" place, to avoid duplicates.
  const showCustom = monetization.customAd.enabled && !!monetization.customAd.html && place === "inline";

  if (!showAdsense && !showCustom) return null;

  return (
    <div className="mx-auto my-6 w-full max-w-5xl px-4 text-center" aria-label="Advertisement">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted">Advertisement</span>
      {showAdsense && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={a.publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
      {showCustom && (
        <iframe
          title="Advertisement"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          srcDoc={`<!doctype html><html><body style="margin:0;display:flex;justify-content:center">${monetization.customAd.html}</body></html>`}
          style={{ width: "100%", height: monetization.customAd.height, border: 0 }}
          loading="lazy"
        />
      )}
    </div>
  );
}
