# OrbitWatch / OrbitMap — 3D Real-Time Satellite Tracker

**Live demo: [orbitmap.space](https://orbitmap.space)**

A real-time 3D satellite tracker built with Next.js 14 and React Three Fiber. Watch the ISS, Hubble, weather satellites, and Starlink move across a live wireframe globe, a 2D map, or a naked-eye sky view — all powered by real orbital data.

---

### 🚀 Hire Me — Custom 3D / WebGL Development

This project is a portfolio piece. If you need a custom **Next.js, React Three Fiber, or WebGL** build — interactive 3D dashboards, data visualizations, real-time tracking apps, or marketing sites with a "mission control" feel like this one — I'm available for freelance and contract work.

📩 **Contact:** [info@orbitmap.space](mailto:info@orbitmap.space)

---

## Make it your own — no code needed

Fork this repo, deploy to **Netlify** (free plan allows commercial use), then open **`/admin`** on your site to change the name, logo, favicon, address, contact details, colors, SEO and to switch on ways to earn (AdSense, affiliate links, sponsor banner, support/Pro button, any other ad network).


> ### ⚠️ Hosting: do NOT use Vercel's free (Hobby) plan for a money-making site
> Vercel's Hobby plan is **personal, non-commercial use only**. If you switch on AdSense, affiliate links, a sponsor banner or a Pro button, use **Netlify's free plan** (commercial use allowed at the time of writing) or a paid Vercel Pro plan. Terms change, so always read your host's current terms yourself.

**One-time setup (about 10 minutes):**

1. Create a free project at [supabase.com](https://supabase.com).
2. Supabase → **SQL Editor** → paste everything from [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. Supabase → **Authentication → Users → Add user** (your email + a strong password).
4. Go to [netlify.com](https://netlify.com) → **Add new project → Import from GitHub** → pick your fork. Build command `npm run build` (already set in `netlify.toml`).
5. Before the first deploy (or after, then redeploy), open **Site configuration → Environment variables** and add the 4 values from [`.env.example`](.env.example): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`.
6. **Deploy** (or **Deploys → Trigger deploy** after adding variables), open `https://your-site.netlify.app/admin`, sign in, edit, press **Save changes**.
7. Custom domain: **Domain management → Add a domain**, then add the DNS record Netlify shows at your domain registrar.

Without Supabase the site still works — it just uses the defaults in [`src/config/site.config.ts`](src/config/site.config.ts).

**Security:** only emails listed in `ADMIN_EMAILS` can save. The service-role key stays on the server. Every saved value is validated server-side (links must be http/https, IDs must match the right format).

**Before you turn on ads:** AdSense needs original content, About/Contact/Privacy pages (included), and approval. Never click your own ads. Always keep the affiliate disclosure text.

## Features

- **Next.js 14 (App Router)** — server components fetch initial data, client components handle all interactivity
- **React Three Fiber + three.js** — a real-time, rotating wireframe 3D globe (no heavy Earth texture, so it loads fast)
- **CelesTrak TLE API integration** — live orbital element data for hundreds of active satellites, fetched server-side and cached (`src/app/api/tle/route.ts`)
- **satellite.js (SGP4/SDP4)** — converts raw TLE data into real-time latitude/longitude/altitude positions
- **Three view modes** — 3D globe, 2D Leaflet map, and a sky-dome "what's above me right now" view
- **Pass predictions** — see when a satellite (e.g. the ISS) will next be visible from your location
- **Tailwind CSS** — utility-first styling with a dark, tactical "mission-control" visual theme
- **PWA-ready** — installable with an offline-capable service worker
- **Optional Supabase backend** — powers the blog and affiliate products pages (not required to run the core tracker)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| 3D rendering | three.js, @react-three/fiber, @react-three/drei |
| Orbital mechanics | satellite.js |
| 2D map | Leaflet, react-leaflet |
| Styling | Tailwind CSS |
| Backend (optional) | Supabase (Postgres + RLS) |
| Data source | [CelesTrak](https://celestrak.org) (free, no API key required) |

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm (or your preferred package manager)

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/orbit-watch.git
cd orbit-watch
npm install
```

### Environment variables

The core satellite tracker (globe, map, sky view, TLE data) works with **no environment variables at all** — CelesTrak requires no API key.

The blog and products pages use Supabase, and analytics is optional. Copy the example env file and fill in your own values if you want those features:

```bash
cp .env.example .env.local
```

See [`.env.example`](.env.example) for the full list of variables and what each one does. Never commit `.env.local` — it's already listed in `.gitignore`.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page loads first; click **Launch App** (or go to `/app`) for the live tracker.

### Production build

```bash
npm run build
npm run start
```

## Deployment

Recommended for sites that earn money: **Netlify** (free plan, commercial use allowed; settings in [`netlify.toml`](netlify.toml)). Connect your GitHub fork, add the environment variables from `.env.example` in the dashboard, and deploy. Vercel Pro also works, but Vercel's free Hobby plan is non-commercial only (see the warning above). Whichever host you use, check its current terms and limits.

## Project Structure

```
src/
  app/            # Next.js App Router pages & API routes
    api/tle/      # Serves cached CelesTrak satellite data
    api/subscribe/# Pass-alert signup endpoint
  components/     # React components (3D scene, HUD, map, sky view, etc.)
  lib/            # Orbital math, TLE fetching/caching, Supabase clients, hooks
  workers/        # Web Worker for off-main-thread orbit propagation
```

See [`PROJECT_DOCUMENTATION.md`](PROJECT_DOCUMENTATION.md) for a full file-by-file breakdown of how the app works.

## Make it yours: rename checklist

If you fork this project, replace the original author's details before publishing:

1. `package.json` → `author`, `homepage`, `repository`, `description`
2. `LICENSE` → copyright line (keep the MIT notice itself)
3. `README.md` → remove or replace the "Hire Me" section and the live demo link
4. `/admin` → site name, logo, favicon, address, phone, email, social links, SEO
5. Add your own logo/images in `public/` (`logo.png`, `favicon-32.png`, `og-blog.png`)

## Security checklist

- Never commit `.env` / `.env.local` (they are in `.gitignore`).
- `SUPABASE_SERVICE_ROLE_KEY` is secret and server-only.
- Use a strong password for your Supabase admin user.
- If you already committed `tsconfig.tsbuildinfo` or `next-env.d.ts`: `git rm --cached tsconfig.tsbuildinfo next-env.d.ts`

## Data sources & credit

Orbital data: [CelesTrak](https://celestrak.org) (no API key). Location search: OpenStreetMap Nominatim. IP location: ipapi.co. Map tiles: CARTO / OpenStreetMap. These free services have fair-use limits; heavy traffic may need your own caching or a paid plan, and each has its own terms. Keep their credits visible.

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss what you'd like to change.

## License

MIT — see [LICENSE](LICENSE) for details.
