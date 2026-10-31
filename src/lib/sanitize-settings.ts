import { DEFAULT_SETTINGS, type AffiliateItem, type SiteSettings } from "@/config/site.config";

// Used on the server for BOTH reading (merge DB row over defaults) and
// writing (validate what the admin sent). Unknown keys are dropped, wrong
// types fall back to defaults, URLs must be http(s) or a /relative path —
// this blocks javascript: links and similar tricks.

const str = (v: unknown, fallback: string, max = 500): string =>
  typeof v === "string" ? v.slice(0, max) : fallback;

const bool = (v: unknown, fallback: boolean): boolean => (typeof v === "boolean" ? v : fallback);

const hex = (v: unknown, fallback: string): string =>
  typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : fallback;

export function safeUrl(v: unknown, fallback = ""): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim().slice(0, 1000);
  if (s === "") return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? s : fallback;
  } catch {
    return fallback;
  }
}

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

function sanitizeItems(v: unknown): AffiliateItem[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 12).map((raw) => {
    const o = obj(raw);
    return {
      title: str(o.title, "", 120),
      description: str(o.description, "", 300),
      url: safeUrl(o.url),
      buttonText: str(o.buttonText, "View", 40) || "View",
      imageUrl: safeUrl(o.imageUrl),
    };
  });
}

export function sanitizeSettings(input: unknown): SiteSettings {
  const d = DEFAULT_SETTINGS;
  const i = obj(input);
  const an = obj(i.announcement);
  const m = obj(i.monetization);
  const ad = obj(m.adsense);
  const ca = obj(m.customAd);
  const af = obj(m.affiliate);
  const sp = obj(m.sponsor);
  const su = obj(m.support);

  const siteUrl = safeUrl(i.siteUrl, d.siteUrl).replace(/\/+$/, "") || d.siteUrl;

  return {
    siteName: str(i.siteName, d.siteName, 60) || d.siteName,
    tagline: str(i.tagline, d.tagline, 200),
    logoUrl: safeUrl(i.logoUrl, d.logoUrl),
    faviconUrl: safeUrl(i.faviconUrl, d.faviconUrl) || d.faviconUrl,
    ogImageUrl: safeUrl(i.ogImageUrl, d.ogImageUrl) || d.ogImageUrl,
    siteUrl,

    heroKicker: str(i.heroKicker, d.heroKicker, 60),
    heroHeadline: str(i.heroHeadline, d.heroHeadline, 120),
    heroSubheadline: str(i.heroSubheadline, d.heroSubheadline, 160),
    heroButtonText: str(i.heroButtonText, d.heroButtonText, 30) || d.heroButtonText,
    footerText: str(i.footerText, d.footerText, 200),

    contactEmail: str(i.contactEmail, d.contactEmail, 120),
    phone: str(i.phone, d.phone, 40),
    address: str(i.address, d.address, 250),
    twitterUrl: safeUrl(i.twitterUrl),
    facebookUrl: safeUrl(i.facebookUrl),
    instagramUrl: safeUrl(i.instagramUrl),
    youtubeUrl: safeUrl(i.youtubeUrl),
    githubUrl: safeUrl(i.githubUrl),

    accentColor: hex(i.accentColor, d.accentColor),
    backgroundColor: hex(i.backgroundColor, d.backgroundColor),

    seoTitle: str(i.seoTitle, d.seoTitle, 120),
    seoDescription: str(i.seoDescription, d.seoDescription, 320),
    seoKeywords: str(i.seoKeywords, d.seoKeywords, 400),
    googleAnalyticsId: /^G-[A-Z0-9]{4,16}$/i.test(String(i.googleAnalyticsId ?? "").trim())
      ? String(i.googleAnalyticsId).trim()
      : "",
    googleSiteVerification: /^[\w-]{10,100}$/.test(String(i.googleSiteVerification ?? "").trim())
      ? String(i.googleSiteVerification).trim()
      : "",

    announcement: {
      enabled: bool(an.enabled, false),
      text: str(an.text, "", 200),
      linkText: str(an.linkText, "", 60),
      linkUrl: safeUrl(an.linkUrl),
    },

    monetization: {
      adsense: {
        enabled: bool(ad.enabled, false),
        publisherId: /^ca-pub-\d{10,20}$/.test(String(ad.publisherId ?? "").trim())
          ? String(ad.publisherId).trim()
          : "",
        headerSlot: /^\d{5,20}$/.test(String(ad.headerSlot ?? "").trim()) ? String(ad.headerSlot).trim() : "",
        inlineSlot: /^\d{5,20}$/.test(String(ad.inlineSlot ?? "").trim()) ? String(ad.inlineSlot).trim() : "",
        footerSlot: /^\d{5,20}$/.test(String(ad.footerSlot ?? "").trim()) ? String(ad.footerSlot).trim() : "",
      },
      customAd: {
        enabled: bool(ca.enabled, false),
        html: str(ca.html, "", 6000),
        height: Math.min(600, Math.max(50, Number(ca.height) || 120)),
      },
      affiliate: {
        enabled: bool(af.enabled, false),
        heading: str(af.heading, d.monetization.affiliate.heading, 80),
        disclosure: str(af.disclosure, d.monetization.affiliate.disclosure, 300),
        showOnHome: bool(af.showOnHome, true),
        items: sanitizeItems(af.items),
      },
      sponsor: {
        enabled: bool(sp.enabled, false),
        imageUrl: safeUrl(sp.imageUrl),
        linkUrl: safeUrl(sp.linkUrl),
        label: str(sp.label, "Sponsored", 30),
        advertiseText: str(sp.advertiseText, "Advertise here", 40),
      },
      support: {
        enabled: bool(su.enabled, false),
        text: str(su.text, d.monetization.support.text, 160),
        buttonText: str(su.buttonText, d.monetization.support.buttonText, 40),
        url: safeUrl(su.url),
      },
    },
  };
}
