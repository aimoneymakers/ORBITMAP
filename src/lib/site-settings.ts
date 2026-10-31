import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/config/site.config";
import { sanitizeSettings } from "@/lib/sanitize-settings";

export const SETTINGS_TAG = "site-settings";

async function loadFromDb(): Promise<SiteSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return DEFAULT_SETTINGS;

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await client
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.data) return DEFAULT_SETTINGS;
    // Merge DB values over defaults, then validate everything.
    return sanitizeSettings({ ...DEFAULT_SETTINGS, ...data.data });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Cached for 60s and instantly refreshed when the admin saves
// (revalidateTag in /api/admin/settings).
export const getSiteSettings = unstable_cache(loadFromDb, ["site-settings-v1"], {
  tags: [SETTINGS_TAG],
  revalidate: 60,
});
