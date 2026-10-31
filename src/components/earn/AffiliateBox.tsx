"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";

export default function AffiliateBox() {
  const { monetization } = useSiteSettings();
  const aff = monetization.affiliate;
  const items = aff.items.filter((i) => i.title && i.url);
  if (!aff.enabled || items.length === 0) return null;

  return (
    <section className="mx-auto my-10 w-full max-w-5xl px-4" aria-label={aff.heading}>
      <h2 className="font-display text-xl font-bold text-ink">{aff.heading}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-orbit/40"
          >
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="h-36 w-full rounded-xl object-cover" loading="lazy" />
            )}
            <span className="font-semibold text-ink">{item.title}</span>
            {item.description && <span className="text-sm text-muted">{item.description}</span>}
            <span className="mt-auto inline-flex w-fit rounded-full bg-orbit px-4 py-1.5 text-sm font-semibold text-void">
              {item.buttonText || "View"}
            </span>
          </a>
        ))}
      </div>
      {aff.disclosure && <p className="mt-3 text-xs text-muted">{aff.disclosure}</p>}
    </section>
  );
}
