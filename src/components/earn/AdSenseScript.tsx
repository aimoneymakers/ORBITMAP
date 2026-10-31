import Script from "next/script";
import type { SiteSettings } from "@/config/site.config";

// Loads the AdSense library once, site-wide, if the admin enabled it.
// Auto ads are controlled inside the AdSense account; manual slots
// (header / inline / footer) are placed by <AdSlot />.
export default function AdSenseScript({ settings }: { settings: SiteSettings }) {
  const a = settings.monetization.adsense;
  if (!a.enabled || !a.publisherId) return null;
  return (
    <Script
      id="adsense-lib"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${a.publisherId}`}
      crossOrigin="anonymous"
    />
  );
}
