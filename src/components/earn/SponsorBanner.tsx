"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";

export default function SponsorBanner() {
  const { monetization, contactEmail, siteName } = useSiteSettings();
  const s = monetization.sponsor;
  if (!s.enabled) return null;
  const hasBanner = !!s.imageUrl && !!s.linkUrl;

  return (
    <div className="mx-auto my-8 w-full max-w-5xl px-4 text-center">
      {hasBanner && (
        <a href={s.linkUrl} target="_blank" rel="sponsored noopener noreferrer" className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted">{s.label}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.imageUrl} alt={s.label} className="mx-auto max-h-32 w-full rounded-xl object-contain" loading="lazy" />
        </a>
      )}
      {s.advertiseText && contactEmail && (
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Advertise on ${siteName}`)}`}
          className="mt-2 inline-block text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          {s.advertiseText}
        </a>
      )}
    </div>
  );
}
