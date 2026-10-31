"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import { DEFAULT_SETTINGS, type AffiliateItem, type SiteSettings } from "@/config/site.config";

type Tab = "brand" | "home" | "contact" | "look" | "earn" | "products" | "bar";
const TABS: { id: Tab; label: string }[] = [
  { id: "brand", label: "Name & Logo" },
  { id: "home", label: "Home Page" },
  { id: "contact", label: "Contact & Social" },
  { id: "look", label: "Colors & SEO" },
  { id: "earn", label: "💰 Earn Money" },
  { id: "products", label: "🛍️ Products" },
  { id: "bar", label: "Announcement" },
];

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-orbit focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted/80">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--toggle,#4fd8eb)]" />
      <span className="text-sm font-semibold text-ink">{label}</span>
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

export default function AdminClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [setupOk, setSetupOk] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("brand");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const token = session?.access_token ?? "";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    // GET without a token: 503 = admin not configured, 401 = configured (just not signed in).
    // (Some hosts such as Netlify do not pass HEAD requests through reliably.)
    fetch("/api/admin/settings")
      .then((r) => setSetupOk(r.status !== 503))
      .catch(() => setSetupOk(true));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    const r = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!r.ok) {
      setMsg({ ok: false, text: j.error ?? "Could not load settings." });
      return;
    }
    setS(j.settings);
    setLoaded(true);
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMsg(error.message);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ settings: s }),
    });
    const j = await r.json();
    setSaving(false);
    if (!r.ok) return setMsg({ ok: false, text: j.error ?? "Save failed." });
    setS(j.settings);
    setMsg({ ok: true, text: "Saved! Open your site in a new tab to see the changes (can take up to a minute)." });
  }

  async function upload(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    const j = await r.json();
    if (!r.ok) {
      setMsg({ ok: false, text: j.error ?? "Upload failed." });
      return null;
    }
    return j.url as string;
  }

  // small immutable-update helpers
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((p) => ({ ...p, [k]: v }));
  const setMon = (path: "adsense" | "customAd" | "affiliate" | "sponsor" | "support", patch: Record<string, unknown>) =>
    setS((p) => ({ ...p, monetization: { ...p.monetization, [path]: { ...p.monetization[path], ...patch } } }));
  const text = (k: keyof SiteSettings) => ({
    value: (s[k] as string) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
  });

  const renderImage = ({ label, k, hint }: { label: string; k: "logoUrl" | "faviconUrl" | "ogImageUrl"; hint?: string }) => {
    const url = s[k];
    return (
      <Field label={label} hint={hint}>
        <div className="flex items-center gap-3">
          {url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-10 w-10 rounded bg-white/5 object-contain" />}
          <input className={inputCls} placeholder="https://… or upload →" {...text(k)} />
          <label className="cursor-pointer whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-ink hover:border-orbit">
            Upload
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/x-icon"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const u = await upload(f);
                if (u) set(k, u);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </Field>
    );
  }

  // ---------- screens ----------
  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-3xl px-4 py-12">{children}</div>
  );

  if (checking) return shell(<p className="text-muted">Loading…</p>);

  if (setupOk === false) {
    return shell(
      <Card title="⚙️ Admin is not set up yet">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink/90">
          <li>Create a free project on <b>supabase.com</b>.</li>
          <li>Supabase → SQL Editor → paste the contents of <code>supabase/schema.sql</code> → Run.</li>
          <li>Supabase → Authentication → Users → <b>Add user</b> (your email + password).</li>
          <li>In your host (Netlify / Vercel) → Environment Variables add: <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code> and <code>ADMIN_EMAILS</code> (your email).</li>
          <li>Redeploy, then come back to this page.</li>
        </ol>
      </Card>
    );
  }

  if (!session) {
    return shell(
      <form onSubmit={signIn} className="mx-auto max-w-sm space-y-4">
        <h1 className="font-display text-2xl font-bold text-ink">Admin login</h1>
        <Field label="Email"><input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><input className={inputCls} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {authMsg && <p className="text-sm text-red-400">{authMsg}</p>}
        <button className="w-full rounded-full bg-orbit px-4 py-2 text-sm font-semibold text-void">Sign in</button>
      </form>
    );
  }

  const m = s.monetization;
  const items = m.affiliate.items;
  const setItem = (i: number, patch: Partial<AffiliateItem>) =>
    setMon("affiliate", { items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

  return shell(
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">Site Admin</h1>
        <div className="flex items-center gap-3 text-xs text-muted">
          {session.user.email}
          <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-white/10 px-3 py-1 hover:text-ink">Sign out</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tab === t.id ? "border-orbit bg-orbit/10 text-orbit" : "border-white/10 text-muted hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {!loaded && !msg && <p className="text-muted">Loading settings…</p>}

      {loaded && tab === "brand" && (
        <Card title="Name & Logo">
          <Field label="Website name"><input className={inputCls} {...text("siteName")} /></Field>
          <Field label="Short tagline" hint="Shown in the footer."><input className={inputCls} {...text("tagline")} /></Field>
          <Field label="Website address (URL)" hint="Your real domain, e.g. https://mysite.com"><input className={inputCls} {...text("siteUrl")} /></Field>
          {renderImage({ label: "Logo", k: "logoUrl", hint: "Optional. Leave empty to keep the built-in icon." })}
          {renderImage({ label: "Favicon (browser tab icon)", k: "faviconUrl", hint: "Square PNG, at least 64×64." })}
          {renderImage({ label: "Share image (social media preview)", k: "ogImageUrl", hint: "1200×630 works best." })}
        </Card>
      )}

      {loaded && tab === "home" && (
        <Card title="Home page text">
          <Field label="Small label above title"><input className={inputCls} {...text("heroKicker")} /></Field>
          <Field label="Main headline"><input className={inputCls} {...text("heroHeadline")} /></Field>
          <Field label="Sub headline"><input className={inputCls} {...text("heroSubheadline")} /></Field>
          <Field label="Button text"><input className={inputCls} {...text("heroButtonText")} /></Field>
          <Field label="Footer note" hint="Shown next to © in the footer."><input className={inputCls} {...text("footerText")} /></Field>
        </Card>
      )}

      {loaded && tab === "contact" && (
        <Card title="Contact & social links">
          <Field label="Contact email"><input className={inputCls} type="email" {...text("contactEmail")} /></Field>
          <Field label="Phone"><input className={inputCls} {...text("phone")} /></Field>
          <Field label="Address"><textarea className={inputCls} rows={2} {...text("address")} /></Field>
          <Field label="YouTube URL"><input className={inputCls} {...text("youtubeUrl")} /></Field>
          <Field label="X / Twitter URL"><input className={inputCls} {...text("twitterUrl")} /></Field>
          <Field label="Facebook URL"><input className={inputCls} {...text("facebookUrl")} /></Field>
          <Field label="Instagram URL"><input className={inputCls} {...text("instagramUrl")} /></Field>
          <Field label="GitHub URL"><input className={inputCls} {...text("githubUrl")} /></Field>
        </Card>
      )}

      {loaded && tab === "look" && (
        <>
          <Card title="Colors">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Accent color (buttons, links)">
                <div className="flex gap-2"><input type="color" value={s.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-10 w-12 rounded" /><input className={inputCls} {...text("accentColor")} /></div>
              </Field>
              <Field label="Background color">
                <div className="flex gap-2"><input type="color" value={s.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} className="h-10 w-12 rounded" /><input className={inputCls} {...text("backgroundColor")} /></div>
              </Field>
            </div>
          </Card>
          <Card title="SEO & Analytics">
            <Field label="Page title (Google)"><input className={inputCls} {...text("seoTitle")} /></Field>
            <Field label="Description (Google)"><textarea className={inputCls} rows={3} {...text("seoDescription")} /></Field>
            <Field label="Keywords" hint="Separate with commas."><input className={inputCls} {...text("seoKeywords")} /></Field>
            <Field label="Google Analytics ID" hint="Looks like G-XXXXXXXXXX. Optional."><input className={inputCls} {...text("googleAnalyticsId")} /></Field>
            <Field label="Google Search Console verification code" hint="Only the code from the meta tag content=... Optional."><input className={inputCls} {...text("googleSiteVerification")} /></Field>
          </Card>
        </>
      )}

      {loaded && tab === "earn" && (
        <>
          <p className="text-sm text-muted">Turn on any method you like — you can use several together. Each one stays hidden until you switch it on.</p>

          <Card title="1) Google AdSense">
            <Toggle checked={m.adsense.enabled} onChange={(v) => setMon("adsense", { enabled: v })} label="Enable AdSense" />
            <Field label="Publisher ID" hint="Looks like ca-pub-1234567890123456 (AdSense → Account → Settings)."><input className={inputCls} value={m.adsense.publisherId} onChange={(e) => setMon("adsense", { publisherId: e.target.value })} /></Field>
            <p className="text-xs text-muted">Auto ads (Google places ads for you) are switched on/off inside your AdSense account → Ads → Overview. Slot IDs below are only for fixed positions.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Header slot ID"><input className={inputCls} value={m.adsense.headerSlot} onChange={(e) => setMon("adsense", { headerSlot: e.target.value })} /></Field>
              <Field label="In-content slot ID"><input className={inputCls} value={m.adsense.inlineSlot} onChange={(e) => setMon("adsense", { inlineSlot: e.target.value })} /></Field>
              <Field label="Footer slot ID"><input className={inputCls} value={m.adsense.footerSlot} onChange={(e) => setMon("adsense", { footerSlot: e.target.value })} /></Field>
            </div>
            <p className="text-xs text-muted">Slot IDs are optional numbers from AdSense → Ads → By ad unit. AdSense must approve your site first.</p>
          </Card>

          <Card title="2) Affiliate products">
            <Toggle checked={m.affiliate.enabled} onChange={(v) => setMon("affiliate", { enabled: v })} label="Show affiliate box" />
            <Toggle checked={m.affiliate.showOnHome} onChange={(v) => setMon("affiliate", { showOnHome: v })} label="Show it on the home page" />
            <Field label="Box heading"><input className={inputCls} value={m.affiliate.heading} onChange={(e) => setMon("affiliate", { heading: e.target.value })} /></Field>
            <Field label="Disclosure text" hint="Required by most affiliate programs and by the law in many countries."><textarea className={inputCls} rows={2} value={m.affiliate.disclosure} onChange={(e) => setMon("affiliate", { disclosure: e.target.value })} /></Field>
            {items.map((it, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-white/10 p-3">
                <div className="flex justify-between text-xs text-muted">Product {i + 1}
                  <button className="text-red-400" onClick={() => setMon("affiliate", { items: items.filter((_, idx) => idx !== i) })}>Remove</button>
                </div>
                <input className={inputCls} placeholder="Title" value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} />
                <input className={inputCls} placeholder="Short description" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                <input className={inputCls} placeholder="Your affiliate link https://…" value={it.url} onChange={(e) => setItem(i, { url: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Button text (e.g. Buy now)" value={it.buttonText} onChange={(e) => setItem(i, { buttonText: e.target.value })} />
                  <input className={inputCls} placeholder="Image URL (optional)" value={it.imageUrl} onChange={(e) => setItem(i, { imageUrl: e.target.value })} />
                </div>
              </div>
            ))}
            {items.length < 12 && (
              <button className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-ink hover:border-orbit"
                onClick={() => setMon("affiliate", { items: [...items, { title: "", description: "", url: "", buttonText: "View", imageUrl: "" }] })}>
                + Add product
              </button>
            )}
          </Card>

          <Card title="3) Sponsor banner">
            <Toggle checked={m.sponsor.enabled} onChange={(v) => setMon("sponsor", { enabled: v })} label="Show sponsor banner + “Advertise here” link" />
            <Field label="Banner image URL"><input className={inputCls} value={m.sponsor.imageUrl} onChange={(e) => setMon("sponsor", { imageUrl: e.target.value })} /></Field>
            <Field label="Sponsor link"><input className={inputCls} value={m.sponsor.linkUrl} onChange={(e) => setMon("sponsor", { linkUrl: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Label"><input className={inputCls} value={m.sponsor.label} onChange={(e) => setMon("sponsor", { label: e.target.value })} /></Field>
              <Field label="“Advertise here” text"><input className={inputCls} value={m.sponsor.advertiseText} onChange={(e) => setMon("sponsor", { advertiseText: e.target.value })} /></Field>
            </div>
          </Card>

          <Card title="4) Support / Pro / Donation button">
            <Toggle checked={m.support.enabled} onChange={(v) => setMon("support", { enabled: v })} label="Show support button" />
            <Field label="Message"><input className={inputCls} value={m.support.text} onChange={(e) => setMon("support", { text: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text"><input className={inputCls} value={m.support.buttonText} onChange={(e) => setMon("support", { buttonText: e.target.value })} /></Field>
              <Field label="Payment link" hint="Buy Me a Coffee, Ko-fi, Lemon Squeezy, Gumroad, PayPal.me, Razorpay link…"><input className={inputCls} value={m.support.url} onChange={(e) => setMon("support", { url: e.target.value })} /></Field>
            </div>
          </Card>

          <Card title="5) Other ad network (Adsterra, Media.net, etc.)">
            <Toggle checked={m.customAd.enabled} onChange={(v) => setMon("customAd", { enabled: v })} label="Show custom ad code" />
            <Field label="Ad code (HTML / script)" hint="Paste the code your ad network gives you. It runs inside a safe sandboxed box."><textarea className={`${inputCls} font-mono`} rows={5} value={m.customAd.html} onChange={(e) => setMon("customAd", { html: e.target.value })} /></Field>
            <Field label="Box height (px)"><input className={inputCls} type="number" min={50} max={600} value={m.customAd.height} onChange={(e) => setMon("customAd", { height: Number(e.target.value) })} /></Field>
          </Card>
        </>
      )}

      {loaded && tab === "bar" && (
        <Card title="Top announcement bar (home page)">
          <Toggle checked={s.announcement.enabled} onChange={(v) => set("announcement", { ...s.announcement, enabled: v })} label="Show announcement bar" />
          <Field label="Text"><input className={inputCls} value={s.announcement.text} onChange={(e) => set("announcement", { ...s.announcement, text: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Link text"><input className={inputCls} value={s.announcement.linkText} onChange={(e) => set("announcement", { ...s.announcement, linkText: e.target.value })} /></Field>
            <Field label="Link URL"><input className={inputCls} value={s.announcement.linkUrl} onChange={(e) => set("announcement", { ...s.announcement, linkUrl: e.target.value })} /></Field>
          </div>
        </Card>
      )}

      {loaded && tab === "products" && <ProductsAdmin token={token} />}

      {loaded && tab !== "products" && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-void/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className={`text-sm ${msg?.ok ? "text-green-400" : "text-red-400"}`}>{msg?.text}</p>
            <button onClick={save} disabled={saving} className="rounded-full bg-orbit px-6 py-2 text-sm font-semibold text-void disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}
      {!loaded && msg && <p className="text-sm text-red-400">{msg.text}</p>}
    </div>
  );
}
