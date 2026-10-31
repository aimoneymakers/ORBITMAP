import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const CATEGORIES = ["gadgets", "hardware", "software", "subscription", "service", "books_media", "other"];
const COLS =
  "id, slug, name, brand, category, short_description, description, image_url, gallery_urls, price_cents, original_price_cents, currency, affiliate_url, rating, rating_count, is_featured, is_new, is_active, sort_weight, created_at";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Only http(s) links (or a site-relative image path) are accepted.
function link(v: unknown, allowRelative = false): string {
  const s = str(v, 2000);
  if (!s) return "";
  if (allowRelative && s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

function money(v: unknown): number | null | "bad" {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return "bad";
  return Math.round(n * 100);
}

function slugify(name: string) {
  return (
    name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) ||
    "product"
  );
}

function clean(b: Record<string, unknown>): { error: string } | { data: Record<string, unknown> } {
  const name = str(b.name, 120);
  if (!name) return { error: "Product name is required." };
  const image_url = link(b.image_url, true);
  if (!image_url) return { error: "Main image is required (upload one or paste an https:// link)." };
  const affiliate_url = link(b.affiliate_url);
  if (!affiliate_url) return { error: "Affiliate link is required and must start with https:// or http://" };

  const price = money(b.price);
  if (price === "bad" || price === null) return { error: "Enter a valid price, e.g. 49.99" };
  const original = money(b.original_price);
  if (original === "bad") return { error: "Original price is not valid." };

  const currency = str(b.currency, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Currency must be 3 letters, e.g. USD, PKR, INR, GBP." };

  const rating = Number(b.rating ?? 0);
  const ratingCount = Number(b.rating_count ?? 0);
  const sort = Number(b.sort_weight ?? 0);
  if (!(rating >= 0 && rating <= 5)) return { error: "Rating must be between 0 and 5." };
  if (!Number.isInteger(ratingCount) || ratingCount < 0) return { error: "Rating count must be a whole number." };
  if (!Number.isInteger(sort) || sort < -1000 || sort > 1000) return { error: "Sort weight must be a whole number (-1000 to 1000)." };

  const gallery = Array.isArray(b.gallery_urls)
    ? (b.gallery_urls as unknown[]).map((g) => link(g, true)).filter(Boolean).slice(0, 8)
    : [];
  const category = str(b.category, 30);

  return {
    data: {
      name,
      brand: str(b.brand, 80) || null,
      category: CATEGORIES.includes(category) ? category : "other",
      short_description: str(b.short_description, 300),
      description: str(b.description, 8000),
      image_url,
      gallery_urls: gallery,
      price_cents: price,
      original_price_cents: original,
      currency,
      affiliate_url,
      rating,
      rating_count: ratingCount,
      is_featured: b.is_featured === true,
      is_new: b.is_new === true,
      is_active: b.is_active !== false,
      sort_weight: sort,
      updated_at: new Date().toISOString(),
    },
  };
}

function refresh(slug?: string) {
  revalidatePath("/products");
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/sitemap.xml");
}

async function body(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const j = await req.json();
    return j && typeof j === "object" ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const tableHint = (m: string) =>
  m.includes("products") ? " Did you run supabase/products.sql in the Supabase SQL Editor?" : "";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(COLS)
    .order("sort_weight", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message + tableHint(error.message) }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const b = await body(req);
  if (!b) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  const c = clean(b);
  if ("error" in c) return NextResponse.json({ error: c.error }, { status: 400 });

  const base = slugify(String(c.data.name));
  for (let i = 0; i < 4; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabaseAdmin.from("products").insert({ ...c.data, slug }).select(COLS).single();
    if (!error) {
      refresh(slug);
      return NextResponse.json({ product: data });
    }
    if (error.code !== "23505") {
      return NextResponse.json({ error: error.message + tableHint(error.message) }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "Could not create a unique link for this product. Change the name." }, { status: 409 });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const b = await body(req);
  const id = b ? str(b.id, 64) : "";
  if (!b || !id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
  const c = clean(b);
  if ("error" in c) return NextResponse.json({ error: c.error }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("products").update(c.data).eq("id", id).select(COLS).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  refresh(data?.slug);
  return NextResponse.json({ product: data });
}

// PATCH { id, is_active } = quick show/hide
export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const b = await body(req);
  const id = b ? str(b.id, 64) : "";
  if (!b || !id || typeof b.is_active !== "boolean") return NextResponse.json({ error: "Bad request." }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({ is_active: b.is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  refresh(data?.slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
  const { data } = await supabaseAdmin.from("products").select("slug").eq("id", id).maybeSingle();
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  refresh(data?.slug);
  return NextResponse.json({ ok: true });
}
