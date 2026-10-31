import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const s = await getSiteSettings();
  const body = {
    name: s.siteName,
    short_name: s.siteName.slice(0, 12),
    description: s.tagline,
    start_url: "/",
    display: "standalone",
    background_color: s.backgroundColor,
    theme_color: s.backgroundColor,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
  return new Response(JSON.stringify(body), { headers: { "content-type": "application/manifest+json" } });
}
