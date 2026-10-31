"use client";

import Link from "next/link";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import BrandLogo from "@/components/BrandLogo";
import AdSlot from "@/components/earn/AdSlot";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Live Map", href: "/app" },
      { label: "What's Above Me?", href: "/app?feature=above-me" },
      { label: "Next Pass Alerts", href: "/app?feature=next-pass" },
      { label: "Products", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Account", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="footerLogoGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8fe7f2" />
          <stop offset="1" stopColor="#3aa9c2" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="8.4" fill="url(#footerLogoGrad)" />
      <ellipse
        cx="16"
        cy="16"
        rx="14.5"
        ry="5.2"
        transform="rotate(-22 16 16)"
        stroke="#4fd8eb"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function SiteFooter() {
  const { siteName, tagline, contactEmail, phone, address, footerText, twitterUrl, facebookUrl, instagramUrl, youtubeUrl, githubUrl } = useSiteSettings();
  const socials = [
    { label: "YouTube", href: youtubeUrl },
    { label: "X / Twitter", href: twitterUrl },
    { label: "Facebook", href: facebookUrl },
    { label: "Instagram", href: instagramUrl },
    { label: "GitHub", href: githubUrl },
  ].filter((x) => x.href);
  const year = new Date().getFullYear();

  return (
    <>
    <AdSlot place="footer" />
    <footer className="border-t border-white/5 bg-void">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <BrandLogo size={22} fallback={<LogoMark />} />
              {siteName}
            </Link>
            <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-muted">{tagline}</p>
            {(phone || address) && (
              <p className="mt-3 max-w-[30ch] text-xs leading-relaxed text-muted">
                {address}
                {address && phone && <br />}
                {phone}
              </p>
            )}
            {socials.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                {socials.map((x) => (
                  <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" className="text-xs text-muted transition-colors hover:text-orbit">
                    {x.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink/80 transition-colors hover:text-orbit">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {year} {siteName}{footerText ? ` · ${footerText}` : ""}
          </p>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              {contactEmail}
            </a>
          )}
        </div>
      </div>
    </footer>
    </>
  );
}
