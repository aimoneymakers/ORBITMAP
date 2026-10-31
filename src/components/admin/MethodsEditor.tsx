"use client";

import { METHOD_KINDS, kindMeta, type ContactMethod, type MethodKind } from "@/lib/contact-methods";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-orbit focus:outline-none";

const newId = () => Math.random().toString(36).slice(2, 10);

export default function MethodsEditor({
  methods,
  onChange,
}: {
  methods: ContactMethod[];
  onChange: (m: ContactMethod[]) => void;
}) {
  const add = (kind: MethodKind) =>
    onChange([...methods, { id: newId(), kind, label: kindMeta(kind).label, value: "", details: "", enabled: true }]);
  const patch = (id: string, p: Partial<ContactMethod>) => onChange(methods.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const remove = (id: string) => onChange(methods.filter((m) => m.id !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= methods.length) return;
    const c = [...methods];
    [c[i], c[j]] = [c[j], c[i]];
    onChange(c);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-base font-bold text-ink">Contact &amp; payment methods</h3>
      <p className="text-xs text-muted/80">
        Add only the methods you use. Switch each one on or off. Enabled methods appear on your /contact page.
        Press <b>Save changes</b> at the bottom when done.
      </p>

      <div className="flex flex-wrap gap-2">
        {METHOD_KINDS.map((k) => (
          <button key={k.kind} type="button" onClick={() => add(k.kind)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-ink hover:border-orbit hover:text-orbit">
            + {k.label}
          </button>
        ))}
      </div>

      {methods.length === 0 && <p className="text-sm text-muted">Nothing added yet. Tap a button above.</p>}

      <ul className="space-y-3">
        {methods.map((m, i) => {
          const meta = kindMeta(m.kind);
          return (
            <li key={m.id} className={`space-y-3 rounded-xl border p-4 ${m.enabled ? "border-white/10" : "border-white/5 opacity-60"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                  <input type="checkbox" checked={m.enabled} onChange={(e) => patch(m.id, { enabled: e.target.checked })} className="h-4 w-4" />
                  {m.enabled ? "Shown on site" : "Hidden"}
                </label>
                <div className="flex gap-2 text-xs">
                  <button type="button" onClick={() => move(i, -1)} className="rounded-full border border-white/10 px-2.5 py-1 text-muted hover:text-ink" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded-full border border-white/10 px-2.5 py-1 text-muted hover:text-ink" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => remove(m.id)} className="rounded-full border border-red-400/40 px-3 py-1 text-red-400 hover:bg-red-400/10">Remove</button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Type</span>
                  <select className={inputCls} value={m.kind} onChange={(e) => patch(m.id, { kind: e.target.value as MethodKind })}>
                    {METHOD_KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Title shown to visitors</span>
                  <input className={inputCls} maxLength={60} value={m.label} onChange={(e) => patch(m.id, { label: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">{meta.valueLabel}</span>
                <input className={inputCls} maxLength={200} placeholder={meta.valuePlaceholder} value={m.value} onChange={(e) => patch(m.id, { value: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Details (optional)</span>
                <textarea className={inputCls} rows={meta.kind === "bank" ? 3 : 2} maxLength={500} placeholder={meta.detailsPlaceholder} value={m.details} onChange={(e) => patch(m.id, { details: e.target.value })} />
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
