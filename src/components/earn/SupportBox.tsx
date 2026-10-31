"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";

// "Buy me a coffee" / Pro plan / donation button. Works with ANY payment
// link: Lemon Squeezy, Paddle, Gumroad, Ko-fi, PayPal.me, Razorpay link, etc.
export default function SupportBox() {
  const { monetization } = useSiteSettings();
  const s = monetization.support;
  if (!s.enabled || !s.url) return null;
  return (
    <div className="mx-auto my-8 flex w-full max-w-3xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <p className="text-sm text-ink/90">{s.text}</p>
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-full bg-orbit px-5 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
      >
        {s.buttonText}
      </a>
    </div>
  );
}
