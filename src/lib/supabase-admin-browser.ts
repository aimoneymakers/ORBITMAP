import { createClient } from "@supabase/supabase-js";

// Browser client used ONLY by the /admin login screen.
// - its own storage key, so it never fights with other Supabase clients on the site
// - a simple no-op lock: the default browser Web Lock can leave getSession()
//   waiting forever (the admin page then shows "Loading…" until you refresh)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const adminAuth = createClient(url, key, {
  auth: {
    storageKey: "sb-admin-session",
    detectSessionInUrl: false,
    lock: async <R,>(_name: string, _timeout: number, fn: () => Promise<R>) => fn(),
  },
});
