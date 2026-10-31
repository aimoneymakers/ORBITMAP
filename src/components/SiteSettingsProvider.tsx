"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/config/site.config";

const Ctx = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export const useSiteSettings = () => useContext(Ctx);
