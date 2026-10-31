"use client";

import { useCallback, useEffect, useState } from "react";

const CATEGORIES: [string, string][] = [
  ["gadgets", "Gadgets"],
  ["hardware", "Hardware"],
  ["software", "Software"],
  ["subscription", "Subscriptions"],
  ["service", "Services"],
  ["books_media", "Books & Media"],
  ["other", "Other"],
];

type Row = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  short_description: string;
  description: string;
  image_url: string;
  gallery_urls: string[] | null;
  price_cents: number;
  original_price_cents: number | null;
  currency: string;
  affiliate_url: string;
  rating: number;
  rating_count: number;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_weight: number;
};

type Draft = {
  id?: string;
  name: string;
  brand: string;
  category: string;
  short_description: string;
  description: string;
  image_url: string;
  gallery: string; // one link per line
  price: string;
  original_price: string;
  currency: string;
  affiliate_url: string;
  rating: string;
  rating_count: string;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_weight: string;
};

const EMPTY: Draft = {
  name: "", brand: "", category: "other", short_description: "", description: "",
  image_url: "", gallery: "", price: "", original_price: "", currency: "USD",
  affiliate_url: "", rating: "0", rating_count: "0",
  is_featured: false, is_new: false, is_active: true, sort_weight: "0",
};

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

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

const fromRow = (r: Row): Draft => ({
  id: r.id,
  name: r.name,
  brand: r.brand ?? "",
  category: r.category,
  short_description: r.short_description,
  description: r.description,
  image_url: r.image_url,
  gallery: (r.gallery_urls ?? []).join("\n"),
  price: String(r.price_cents / 100),
  original_price: r.original_price_cents != null ? String(r.original_price_cents / 100) : "",
  currency: r.currency,
  affiliate_url: r.affiliate_url,
  rating: String(r.rating),
  rating_count: String(r.rating_count),
  is_featured: r.is_featured,
  is_new: r.is_new,
  is_active: r.is_active,
  sort_weight: String(r.sort_weight),
});

const money = (cents: number, cur: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${cur}`;
  }
};

export default function ProductsAdmin({ token }: { token: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!r.ok) {
      setMsg({ ok: false, text: j.error ?? "Could not load products." });
      setRows([]);
      return;
    }
    setRows(j.products as Row[]);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

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

  async function save() {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    const payload = { ...draft, gallery_urls: draft.gallery.split("\n").map((g) => g.trim()).filter(Boolean) };
    const r = await fetch("/api/admin/products", {
      method: draft.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: j.error ?? "Save failed." });
    setMsg({ ok: true, text: draft.id ? "Product updated." : "Product added. It is live on /products now." });
    setDraft(null);
    load();
  }

  async function toggle(p: Row) {
    const r = await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    if (!r.ok) setMsg({ ok: false, text: (await r.json()).error ?? "Failed." });
    load();
  }

  async function remove(p: Row) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/products?id=${encodeURIComponent(p.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) setMsg({ ok: false, text: (await r.json()).error ?? "Delete failed." });
    else setMsg({ ok: true, text: "Product deleted." });
    load();
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  if (draft) {
    return (
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-display text-base font-bold text-ink">{draft.id ? "Edit product" : "Add product"}</h3>
        <Field label="Product name *"><input className={inputCls} value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand"><input className={inputCls} value={draft.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
          <Field label="Category">
            <select className={inputCls} value={draft.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Short description" hint="One or two lines shown on the product card."><textarea className={inputCls} rows={2} value={draft.short_description} onChange={(e) => set("short_description", e.target.value)} /></Field>
        <Field label="Full details" hint="Shown on the product page."><textarea className={inputCls} rows={6} value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>

        <Field label="Main image *" hint="Upload a PNG/JPG/WEBP (max 2 MB) or paste an image link.">
          <div className="flex gap-2">
            <input className={inputCls} placeholder="https://… or upload →" value={draft.image_url} onChange={(e) => set("image_url", e.target.value)} />
            <span className="inline-flex shrink-0 cursor-pointer items-center rounded-lg border border-white/10 px-3 text-sm font-semibold text-ink hover:border-orbit">
              Upload
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await upload(f); if (u) set("image_url", u); } e.target.value = ""; }} />
            </span>
          </div>
          {draft.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={draft.image_url} alt="" className="mt-2 h-24 rounded-lg bg-white object-contain p-1" />}
        </Field>
        <Field label="More images (optional)" hint="One image link per line, up to 8. Use Upload to add one.">
          <textarea className={inputCls} rows={3} value={draft.gallery} onChange={(e) => set("gallery", e.target.value)} />
          <span className="mt-2 inline-flex cursor-pointer rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-ink hover:border-orbit">
            Upload another image
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const u = await upload(f); if (u) set("gallery", draft.gallery ? `${draft.gallery}\n${u}` : u); } e.target.value = ""; }} />
          </span>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price *"><input type="number" min="0" step="0.01" className={inputCls} value={draft.price} onChange={(e) => set("price", e.target.value)} /></Field>
          <Field label="Old price" hint="Optional. Shows a discount."><input type="number" min="0" step="0.01" className={inputCls} value={draft.original_price} onChange={(e) => set("original_price", e.target.value)} /></Field>
          <Field label="Currency" hint="USD, PKR, INR, GBP…"><input className={inputCls} maxLength={3} value={draft.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} /></Field>
        </div>

        <Field label="Affiliate link *" hint="Your tracking link from Amazon, a brand, Lemon Squeezy, etc. The “View Deal” button opens this.">
          <input className={inputCls} placeholder="https://…" value={draft.affiliate_url} onChange={(e) => set("affiliate_url", e.target.value)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rating (0-5)"><input type="number" min="0" max="5" step="0.1" className={inputCls} value={draft.rating} onChange={(e) => set("rating", e.target.value)} /></Field>
          <Field label="Rating count"><input type="number" min="0" step="1" className={inputCls} value={draft.rating_count} onChange={(e) => set("rating_count", e.target.value)} /></Field>
          <Field label="Sort weight" hint="Higher number shows first."><input type="number" step="1" className={inputCls} value={draft.sort_weight} onChange={(e) => set("sort_weight", e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <Check checked={draft.is_active} onChange={(v) => set("is_active", v)} label="Visible on site" />
          <Check checked={draft.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" />
          <Check checked={draft.is_new} onChange={(v) => set("is_new", v)} label="Mark as New" />
        </div>

        {msg && <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
        <div className="flex gap-3">
          <button onClick={save} disabled={busy} className="rounded-full bg-orbit px-6 py-2 text-sm font-semibold text-void disabled:opacity-60">
            {busy ? "Saving…" : draft.id ? "Update product" : "Add product"}
          </button>
          <button onClick={() => { setDraft(null); setMsg(null); }} className="rounded-full border border-white/10 px-5 py-2 text-sm text-muted hover:text-ink">Cancel</button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-ink">Products (affiliate store)</h3>
        <button onClick={() => { setDraft({ ...EMPTY }); setMsg(null); }} className="rounded-full bg-orbit px-5 py-2 text-sm font-semibold text-void">+ Add product</button>
      </div>
      <p className="text-xs text-muted/80">Products appear on your /products page. Each one has an image, details, price and your affiliate link.</p>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>}
      {rows === null && <p className="text-muted">Loading products…</p>}
      {rows && rows.length === 0 && !msg && <p className="text-sm text-muted">No products yet. Click “Add product”.</p>}
      <ul className="space-y-3">
        {(rows ?? []).map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" className="h-14 w-14 rounded-lg bg-white object-contain p-1" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
              <p className="text-xs text-muted">
                {money(p.price_cents, p.currency)}
                {!p.is_active && <span className="ml-2 text-amber-400">Hidden</span>}
                {p.is_featured && <span className="ml-2 text-orbit">Featured</span>}
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button onClick={() => { setDraft(fromRow(p)); setMsg(null); }} className="rounded-full border border-white/10 px-3 py-1 text-ink hover:border-orbit">Edit</button>
              <button onClick={() => toggle(p)} className="rounded-full border border-white/10 px-3 py-1 text-muted hover:text-ink">{p.is_active ? "Hide" : "Show"}</button>
              <button onClick={() => remove(p)} className="rounded-full border border-red-400/40 px-3 py-1 text-red-400 hover:bg-red-400/10">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
