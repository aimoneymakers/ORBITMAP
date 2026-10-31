"use client";

import { useSiteSettings } from "@/components/SiteSettingsProvider";

// Shows the admin-uploaded logo if there is one, otherwise the built-in icon.
export default function BrandLogo({ size = 24, fallback }: { size?: number; fallback: React.ReactNode }) {
  const { logoUrl, siteName } = useSiteSettings();
  if (!logoUrl) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logoUrl} alt={`${siteName} logo`} width={size} height={size} style={{ height: size, width: "auto", maxWidth: size * 4 }} className="shrink-0 object-contain" />;
}
