import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const TYPES = ["affiliate", "sponsor", "product_listing", "suggestion", "other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort limit per visitor (resets when the server instance restarts).
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend success, save nothing.
  if (clean(b.company, 100)) return NextResponse.json({ ok: true });

  const name = clean(b.name, 200);
  const email = clean(b.email, 200).toLowerCase();
  const description = clean(b.description, 5000);
  const inquiry = clean(b.inquiry_type, 30);
  const inquiry_type = TYPES.includes(inquiry) ? inquiry : "other";

  if (!name || !EMAIL_RE.test(email) || !description) {
    return NextResponse.json({ error: "Please fill in your name, a valid email, and a message." }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "The contact form is not set up yet. Please email us directly." }, { status: 503 });
  }

  const ip = (req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  // Same email: max 3 messages per hour.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if ((count ?? 0) >= 3) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  const { error } = await supabaseAdmin.from("contact_submissions").insert({
    name,
    email,
    inquiry_type,
    description,
    source_page: "/contact",
  });
  if (error) {
    console.error("contact_submissions insert failed:", error.message);
    return NextResponse.json({ error: "Could not send your message. Please email us directly." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
