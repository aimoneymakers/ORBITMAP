import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const COLS = "id, name, email, inquiry_type, description, source_page, is_read, created_at";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await supabaseAdmin
    .from("contact_submissions")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    return NextResponse.json(
      { error: error.message + " Did you run supabase/contact.sql in the Supabase SQL Editor?" },
      { status: 500 }
    );
  }
  return NextResponse.json({ messages: data ?? [] });
}

// PATCH { id, is_read }
export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const b = await req.json().catch(() => null);
  if (!b || typeof b.id !== "string" || typeof b.is_read !== "boolean") {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("contact_submissions").update({ is_read: b.is_read }).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const { error } = await supabaseAdmin.from("contact_submissions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
