import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";
import { getSiteSettings } from "@/lib/site-settings";

// BASE_URL comes from /admin settings (siteUrl)

export const revalidate = 3600; // rebuild sitemap at most once an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = (await getSiteSettings()).siteUrl;
  const now = new Date();

  // --- Static routes -------------------------------------------------
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/app`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    // Note: /account is excluded on purpose (auth-gated, not indexable).
  ];

  // --- Dynamic product pages ------------------------------------------
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from("products")
      .select("slug")
      .eq("is_active", true);

    productRoutes =
      products?.map((product) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })) ?? [];
  } catch (err) {
    console.error("sitemap: failed to load products from Supabase", err);
  }

  return [...staticRoutes, ...productRoutes];
}
