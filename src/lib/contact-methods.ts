// Contact & payment methods the site owner can switch on/off in /admin.
// Shared by the admin editor, the settings sanitizer and the /contact page.

export type MethodKind =
  | "email" | "phone" | "whatsapp" | "telegram"
  | "bank" | "easypaisa" | "jazzcash" | "paypal" | "payoneer" | "wise" | "crypto" | "link";

export type ContactMethod = {
  id: string;
  kind: MethodKind;
  label: string;
  value: string; // email / number / account / link
  details: string; // account title, bank name, IBAN, notes (optional)
  enabled: boolean;
};

export type KindMeta = {
  kind: MethodKind;
  group: "contact" | "payment";
  label: string;
  valueLabel: string;
  valuePlaceholder: string;
  detailsPlaceholder: string;
};

export const METHOD_KINDS: KindMeta[] = [
  { kind: "email", group: "contact", label: "Email", valueLabel: "Email address", valuePlaceholder: "support@yourdomain.com", detailsPlaceholder: "e.g. We reply within 2 days" },
  { kind: "phone", group: "contact", label: "Phone", valueLabel: "Phone number", valuePlaceholder: "+92 300 1234567", detailsPlaceholder: "e.g. Mon-Fri, 10am-6pm" },
  { kind: "whatsapp", group: "contact", label: "WhatsApp", valueLabel: "WhatsApp number (with country code)", valuePlaceholder: "+923001234567", detailsPlaceholder: "" },
  { kind: "telegram", group: "contact", label: "Telegram", valueLabel: "Username or link", valuePlaceholder: "@yourname", detailsPlaceholder: "" },
  { kind: "bank", group: "payment", label: "Bank account", valueLabel: "Account number / IBAN", valuePlaceholder: "PK00XXXX0000000000000000", detailsPlaceholder: "Bank name\nAccount title\nBranch" },
  { kind: "easypaisa", group: "payment", label: "Easypaisa", valueLabel: "Easypaisa number", valuePlaceholder: "03XX XXXXXXX", detailsPlaceholder: "Account title" },
  { kind: "jazzcash", group: "payment", label: "JazzCash", valueLabel: "JazzCash number", valuePlaceholder: "03XX XXXXXXX", detailsPlaceholder: "Account title" },
  { kind: "paypal", group: "payment", label: "PayPal", valueLabel: "PayPal.me link or email", valuePlaceholder: "https://paypal.me/yourname", detailsPlaceholder: "" },
  { kind: "payoneer", group: "payment", label: "Payoneer", valueLabel: "Payoneer link or email", valuePlaceholder: "https://link.payoneer.com/...", detailsPlaceholder: "" },
  { kind: "wise", group: "payment", label: "Wise", valueLabel: "Wise link or email", valuePlaceholder: "https://wise.com/pay/me/...", detailsPlaceholder: "" },
  { kind: "crypto", group: "payment", label: "Crypto wallet", valueLabel: "Wallet address", valuePlaceholder: "0x...", detailsPlaceholder: "Network, e.g. USDT (TRC20)" },
  { kind: "link", group: "payment", label: "Other payment link", valueLabel: "Payment link", valuePlaceholder: "https://...", detailsPlaceholder: "" },
];

export const KIND_SET = new Set<string>(METHOD_KINDS.map((k) => k.kind));
export const kindMeta = (k: MethodKind) => METHOD_KINDS.find((m) => m.kind === k) ?? METHOD_KINDS[METHOD_KINDS.length - 1];

function httpUrl(v: string): string {
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch {
    return "";
  }
}

// A safe click-through link for a method, or "" when it is copy-only (bank, Easypaisa...).
export function methodHref(kind: MethodKind, value: string): string {
  const v = value.trim();
  if (!v) return "";
  const digits = v.replace(/\D/g, "");
  switch (kind) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? `mailto:${v}` : "";
    case "phone":
      return digits.length >= 6 ? `tel:${v.replace(/[^\d+]/g, "")}` : "";
    case "whatsapp":
      return httpUrl(v) || (digits.length >= 7 ? `https://wa.me/${digits}` : "");
    case "telegram":
      return httpUrl(v) || (/^@?[A-Za-z0-9_]{4,32}$/.test(v) ? `https://t.me/${v.replace(/^@/, "")}` : "");
    case "paypal":
      return httpUrl(v) || (/^(www\.)?paypal\.me\//i.test(v) ? `https://${v}` : "");
    case "payoneer":
    case "wise":
    case "link":
      return httpUrl(v);
    default:
      return "";
  }
}
