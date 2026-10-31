import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import SiteChrome from "@/components/SiteChrome";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import AdSenseScript from "@/components/earn/AdSenseScript";
import { getSiteSettings } from "@/lib/site-settings";
import { hexToChannels } from "@/lib/color";

// Premium humanist sans — powers all headings, body copy, labels, and
// button text. Kept as one family (mapped to --font-sans, with --font-display
// and --font-body aliased to it in tailwind.config.ts) so every existing
// font-display / font-body className in the app upgrades automatically.
const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Numeric/coordinate streams (lat/lon, UTC, velocity, etc.) stay monospace
// for readability — untouched by the visual refresh.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const keywords = s.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  const base = new URL(s.siteUrl);
  return {
    title: { default: s.seoTitle || s.siteName, template: `%s | ${s.siteName}` },
    description: s.seoDescription,
    keywords,
    metadataBase: base,
    alternates: { canonical: s.siteUrl },
    manifest: "/site.webmanifest",
    icons: { icon: [{ url: s.faviconUrl }], apple: [{ url: s.faviconUrl }] },
    verification: s.googleSiteVerification ? { google: s.googleSiteVerification } : undefined,
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: s.siteName },
    openGraph: {
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      type: "website",
      siteName: s.siteName,
      url: s.siteUrl,
      images: [{ url: s.ogImageUrl, width: 1200, height: 630, alt: s.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      images: [s.ogImageUrl],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const colorVars = `:root{--c-orbit:${hexToChannels(settings.accentColor)};--c-void:${hexToChannels(settings.backgroundColor)};}`;

  return (
    <html lang="en" className={`${sansFont.variable} ${mono.variable} font-sans antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: colorVars }} />
        <meta name="theme-color" content={settings.backgroundColor} />
      </head>
      <body className="bg-void text-ink antialiased">
        <GoogleAnalytics id={settings.googleAnalyticsId} />
        <AdSenseScript settings={settings} />
        <ServiceWorkerRegister />
        <SiteSettingsProvider settings={settings}>
          <SiteChrome>{children}</SiteChrome>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
