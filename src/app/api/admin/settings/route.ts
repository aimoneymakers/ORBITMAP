import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin, adminConfigured } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sanitizeSettings } from "@/lib/sanitize-settings";
import { SETTINGS_TAG } from "@/lib/site-settings";
import { DEFAULT_SETTINGS } from "@/config/site.config";

export const dynamic = "force-dynamic";

// GET /api/admin/settings → no auth needed to know if admin is set up
export async function HEAD() {
  return new NextResponse(null, { status: adminConfigured() ? 200 : 503 });
}

export async function GET(req: Request) {
  // Run the admin check and the database read in parallel (saves one round trip).
  // The data is only returned if the admin check passes.
  const [auth, { data, error }] = await Promise.all([
    requireAdmin(req),
    supabaseAdmin.from("site_settings").select("data").eq("id", 1).maybeSingle(),
  ]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (error) {
    return NextResponse.json(
      { error: "Could not read settings. Did you run supabase/schema.sql? (" + error.message + ")" },
      { status: 500 }
    );
  }
  return NextResponse.json({ settings: sanitizeSettings({ ...DEFAULT_SETTINGS, ...(data?.data ?? {}) }) });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const clean = sanitizeSettings((body as { settings?: unknown })?.settings);
  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, settings: clean });
}
