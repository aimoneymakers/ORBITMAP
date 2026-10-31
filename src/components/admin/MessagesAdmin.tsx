"use client";

import { useCallback, useEffect, useState } from "react";

type Msg = {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  description: string;
  source_page: string | null;
  is_read: boolean;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  affiliate: "Affiliate partnership",
  sponsor: "Sponsorship",
  product_listing: "Product listing",
  suggestion: "Suggestion / feedback",
  other: "Other",
};

export default function MessagesAdmin({ token }: { token: string }) {
  const [rows, setRows] = useState<Msg[] | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/messages", { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!r.ok) {
      setErr(j.error ?? "Could not load messages.");
      setRows([]);
      return;
    }
    setErr("");
    setRows(j.messages as Msg[]);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function mark(m: Msg) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: m.id, is_read: !m.is_read }),
    });
    load();
  }

  async function remove(m: Msg) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    await fetch(`/api/admin/messages?id=${encodeURIComponent(m.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  const unread = (rows ?? []).filter((m) => !m.is_read).length;

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">Contact form messages</h3>
        <span className="text-xs text-muted">{rows ? `${unread} unread / ${rows.length} total` : ""}</span>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {rows === null && <p className="text-muted">Loading messages…</p>}
      {rows && rows.length === 0 && !err && <p className="text-sm text-muted">No messages yet.</p>}
      <ul className="space-y-3">
        {(rows ?? []).map((m) => (
          <li key={m.id} className={`rounded-xl border p-4 ${m.is_read ? "border-white/10" : "border-orbit/50 bg-orbit/5"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {m.name} {!m.is_read && <span className="ml-1 rounded-full bg-orbit px-2 py-0.5 text-[10px] font-bold text-void">NEW</span>}
                </p>
                <p className="text-xs text-muted">
                  {m.email} · {TYPE_LABEL[m.inquiry_type] ?? m.inquiry_type} · {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`} className="rounded-full bg-orbit px-3 py-1 font-semibold text-void">Reply</a>
                <button onClick={() => mark(m)} className="rounded-full border border-white/10 px-3 py-1 text-muted hover:text-ink">{m.is_read ? "Mark unread" : "Mark read"}</button>
                <button onClick={() => remove(m)} className="rounded-full border border-red-400/40 px-3 py-1 text-red-400 hover:bg-red-400/10">Delete</button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/90">{m.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
