// Default site settings. Every value here can be overridden from /admin
// (saved in the Supabase `site_settings` table). If Supabase is not
// connected, the site simply uses these defaults — nothing breaks.

export type AffiliateItem = {
  title: string;
  description: string;
  url: string;
  buttonText: string;
  imageUrl: string;
};

export type SiteSettings = {
  // --- Branding ---
  siteName: string;
  tagline: string;
  logoUrl: string; // empty = built-in logo icon
  faviconUrl: string;
  ogImageUrl: string;
  siteUrl: string; // https://yourdomain.com (no trailing slash)

  // --- Home page ---
  heroKicker: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroButtonText: string;
  footerText: string;

  // --- Contact ---
  contactEmail: string;
  phone: string;
  address: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  githubUrl: string;

  // --- Look ---
  accentColor: string; // hex
  backgroundColor: string; // hex

  // --- SEO ---
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  googleAnalyticsId: string;
  googleSiteVerification: string;

  // --- Announcement bar ---
  announcement: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkUrl: string;
  };

  // --- Earning / monetization ---
  monetization: {
    adsense: {
      enabled: boolean;
      publisherId: string; // ca-pub-XXXXXXXXXXXXXXXX
      headerSlot: string;
      inlineSlot: string;
      footerSlot: string;
    };
    customAd: {
      enabled: boolean;
      html: string; // any other ad network code (runs in a sandboxed frame)
      height: number;
    };
    affiliate: {
      enabled: boolean;
      heading: string;
      disclosure: string;
      showOnHome: boolean;
      items: AffiliateItem[];
    };
    sponsor: {
      enabled: boolean;
      imageUrl: string;
      linkUrl: string;
      label: string;
      advertiseText: string; // "Advertise here" link text
    };
    support: {
      enabled: boolean;
      text: string;
      buttonText: string;
      url: string; // Buy Me a Coffee, Ko-fi, Lemon Squeezy, Gumroad, PayPal.me...
    };
  };
};

// Where the site lives. Netlify/Vercel give us this automatically; you can also set
// NEXT_PUBLIC_SITE_URL. It is only a fallback until you save /admin settings.
const ENV_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  process.env.URL || // set automatically by Netlify
 
  "http://localhost:3000";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "My Sat Tracker",
  tagline: "Live 3D satellite & ISS tracking, built on public orbital data.",
  logoUrl: "",
  faviconUrl: "/favicon-32.png",
  ogImageUrl: "/og-blog.png",
  siteUrl: ENV_URL.replace(/\/+$/, ""),

  heroKicker: "LIVE ORBITAL DATA",
  heroHeadline: "Track Satellites & ISS in Real-Time",
  heroSubheadline: "Live 3D Orbital Map • See What's Above You",
  heroButtonText: "Launch App",
  footerText: "Not affiliated with NASA, ESA, or any space agency.",

  contactEmail: "hello@example.com",
  phone: "",
  address: "",
  twitterUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  githubUrl: "",

  accentColor: "#4FD8EB",
  backgroundColor: "#05070D",

  seoTitle: "Live ISS & Satellite Tracker | Real-Time 3D Orbital Map",
  seoDescription:
    "Track the ISS, Hubble, Tiangong, and more in a live 3D orbital map. Real-time positions from public TLE data, plus visible-pass predictions for your exact location — free, no signup.",
  seoKeywords:
    "ISS tracker, satellite tracker, live satellite map, ISS pass predictions, Hubble tracker, orbital map",
  googleAnalyticsId: "",
  googleSiteVerification: "",

  announcement: {
    enabled: false,
    text: "",
    linkText: "",
    linkUrl: "",
  },

  monetization: {
    adsense: {
      enabled: false,
      publisherId: "",
      headerSlot: "",
      inlineSlot: "",
      footerSlot: "",
    },
    customAd: { enabled: false, html: "", height: 120 },
    affiliate: {
      enabled: false,
      heading: "Recommended for you",
      disclosure:
        "Some links are affiliate links. If you buy through them we may earn a commission at no extra cost to you.",
      showOnHome: true,
      items: [],
    },
    sponsor: {
      enabled: false,
      imageUrl: "",
      linkUrl: "",
      label: "Sponsored",
      advertiseText: "Advertise here",
    },
    support: {
      enabled: false,
      text: "Enjoying this site? Help keep it free.",
      buttonText: "Support us",
      url: "",
    },
  },
};
