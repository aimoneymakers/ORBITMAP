"use client";

import { useState } from "react";
import { kindMeta, methodHref, type ContactMethod } from "@/lib/contact-methods";

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked: user can still select the text */
        }
      }}
      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-orbit/40 hover:text-orbit"
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function Card({ m }: { m: ContactMethod }) {
  const meta = kindMeta(m.kind);
  const href = methodHref(m.kind, m.value);
  const external = href.startsWith("http");
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{m.label || meta.label}</p>
      <p className="mt-1.5 break-all font-mono text-sm text-ink">{m.value}</p>
      {m.details && <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-muted">{m.details}</p>}
      <div className="mt-3 flex gap-2">
        <CopyButton text={m.value} />
        {href && (
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="rounded-full bg-orbit px-3 py-1 text-xs font-semibold text-void"
          >
            Open
          </a>
        )}
      </div>
    </div>
  );
}

export default function ContactMethods({ methods }: { methods: ContactMethod[] }) {
  const contact = methods.filter((m) => kindMeta(m.kind).group === "contact");
  const payment = methods.filter((m) => kindMeta(m.kind).group === "payment");
  return (
    <div className="mt-10 space-y-8">
      {contact.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">More ways to reach us</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{contact.map((m) => <Card key={m.id} m={m} />)}</div>
        </section>
      )}
      {payment.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Payment &amp; support options</h2>
          <p className="mt-1 text-xs text-muted">Please double-check the details before sending any payment.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{payment.map((m) => <Card key={m.id} m={m} />)}</div>
        </section>
      )}
    </div>
  );
}
