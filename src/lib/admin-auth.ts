import { supabaseAdmin } from "@/lib/supabase-admin";

// Admin = a Supabase-authenticated user whose email is listed in the
// ADMIN_EMAILS environment variable (comma separated). The check runs on
// the server with the user's access token, so it cannot be faked from the
// browser.

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function adminConfigured(): boolean {
  return (
    adminEmails().length > 0 &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

// Remember a verified token for 60 seconds so repeated admin calls (settings,
// products, messages, upload) do not each wait for a Supabase round trip.
const verified = new Map<string, { email: string; until: number }>();

export async function requireAdmin(req: Request): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  if (!adminConfigured()) {
    return { ok: false, status: 503, error: "Admin is not configured. Set ADMIN_EMAILS and the Supabase keys." };
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "Not signed in." };

  const hit = verified.get(token);
  if (hit && hit.until > Date.now()) return { ok: true, email: hit.email };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return { ok: false, status: 401, error: "Invalid session. Please sign in again." };
  if (!adminEmails().includes(email)) return { ok: false, status: 403, error: "This account is not an admin." };
  if (verified.size > 200) verified.clear();
  verified.set(token, { email, until: Date.now() + 60_000 });
  return { ok: true, email };
}
