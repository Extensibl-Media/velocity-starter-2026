# VWS Starter 2026

A reusable **local-services website starter** built on Astro 7 + Tailwind v4, running as a **Cloudflare SSR Worker**. Pages are composed from **a section registry**, styling flows from a **single theme file**, and content lives in **EmDash** (Cloudflare D1) — editable in the admin at `/_emdash/admin`. Clone it once per business; reskin and refill without touching the engine.

The repo ships with a complete demo site — **Peak Roofing Co** (Boise, ID) — that doubles as the default content and a client-facing showcase.

---

## Quick start

Requires **Node ≥ 22.12**.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static output -> ./dist
npm run preview    # preview the build
npx astro check    # type-check (no `check` script defined)
```

---

## The three-layer model

Everything is one of three things. Keep them separate and new builds stay easy, engine updates stay mergeable.

| Layer | Lives in | Per-site? | You edit it… |
| --- | --- | --- | --- |
| **Bones** (engine) | `src/components/sections/`, `src/lib/`, `src/layouts/`, `src/lib/sectionRegistry.ts` | No — shared, upstream-tracked | Rarely. Add new section *variants* here (benefits every site). |
| **Theme** (look & feel) | `src/styles/theme.css` | **Yes** | Reskin here — one file. |
| **Content** | `src/content/` (pages, services, service-areas, reviews, faqs, posts, settings) | **Yes** | Every build. |

Section components are **theme-pure**: they read design tokens and never hardcode a color, radius, or shadow. That's what makes a clone reskinnable from one file — and what keeps `git merge upstream` clean.

---

## Reskinning a site

**Everything visual is a token in [`src/styles/theme.css`](src/styles/theme.css)** — palette, fonts, heading weight, corner radius, border width, shadow style, and section density. Edit those values and the whole site (every section + the Starwind UI) follows. No component edits.

```css
/* src/styles/theme.css — turn the default into a sharp, navy, editorial brand */
--t-primary: #0d3b66;
--t-secondary: #ee6c4d;
--t-font-heading: Georgia, serif;
--t-radius: 0rem;          /* soft → sharp */
--t-shadow-md: 4px 4px 0 0 rgba(13,27,42,.9);  /* soft → hard offset */
```

Ready-made alternates live in [`src/styles/themes/`](src/styles/themes/) (e.g. `harbor.css`). To use one, copy its `:root` block over the one in `theme.css`, or point `global.css`'s `@import` at it.

> **Why tokens, not per-site component copies:** if a new site needs a structurally different section, add a *new registered variant* to the shared library (see below) — never fork a component into the site repo. Forked components are what make N sites unmaintainable.

---

## How pages work

1. A page is a JSON file in [`src/content/pages/`](src/content/pages/). Its filename is its URL (`index.json` → `/`, `about.json` → `/about`, `meridian-id-roof-repair.json` uses its `slug` field → `/meridian-id/roof-repair`).
2. Each page has a `sections: []` array. Every entry is `{ type, theme, data }`.
3. [`src/pages/[...slug].astro`](src/pages/%5B...slug%5D.astro) renders the page through [`PageRenderer.astro`](src/components/PageRenderer.astro), which looks up `type` in the registry.
4. [`src/lib/sectionRegistry.ts`](src/lib/sectionRegistry.ts) maps `type` → component.

`theme` on each section is one of `default | alt | muted | inverse | primary | brand-secondary` — background/foreground treatments that derive from the same tokens.

### Adding a new section type

1. Build the component under `src/components/sections/<group>/<Name>.astro`. It receives `{ theme, data }`. Use design tokens / `theme-*` utility classes — no hardcoded colors.
2. Import it in [`src/lib/sectionRegistry.ts`](src/lib/sectionRegistry.ts) and add the `"group:variant"` key. **Static import required** — Astro components can't be dynamically imported.
3. Reference it from any page's `sections` array.

---

## Images

Author image paths as **strings in JSON**; the resolver in [`src/lib/images.ts`](src/lib/images.ts) turns them into optimized Astro images.

- Put images in `src/assets/images/` and reference them as `/src/assets/images/foo.jpg` — auto-optimized (responsive WebP).
- Use [`SmartImage.astro`](src/components/media/SmartImage.astro) in components for `<img>`, or `getBackgroundImage()` for CSS backgrounds.
- Public/remote URLs (`/images/…`, `https://…`) pass through untouched.

---

## Content model (`src/content/`)

| Collection | Purpose |
| --- | --- |
| `pages/*.json` | Section-composed pages (the routing surface) |
| `services/*.md` | Service offerings |
| `service-areas/*.json` | Geographic areas (feed maps, geo pages, nav) |
| `reviews/*.json` | Customer reviews (feed review sections + schema) |
| `faqs/*.json` | FAQs (feed FAQ sections + `FAQPage` JSON-LD) |
| `posts/*.md` | Blog posts (`/blog/[slug]`) |
| `settings/*.json` | Singletons: general, hours, seo, navigation |

Schemas are defined in [`src/content.config.ts`](src/content.config.ts). Edit through Decap CMS at `/admin` (config in [`public/admin/config.yml`](public/admin/config.yml)).

---

## Starting a new site from this template

1. **Create the repo** from this template (GitHub → *Use this template*), or clone it.
2. **Track the starter as upstream** so you can pull engine improvements:
   ```sh
   git remote add upstream <starter-repo-url>
   # later: git fetch upstream && git merge upstream/main
   ```
3. **Reskin** — edit `src/styles/theme.css`.
4. **Set identity** — `src/content/settings/general.json` (name, phone, address), `seo.json`, `navigation.json`.
5. **Replace content** — rewrite `src/content/pages/`, `services/`, `service-areas/`, `reviews/`, `faqs/`; drop real images into `src/assets/images/`.
6. **Deploy** — static output; configured for Cloudflare (`wrangler.jsonc`).

Because per-site work stays in the theme + content layers, upstream engine merges rarely conflict.

---

## Notes

- Path alias `@/*` → `src/*`.
- Env schema is declared in [`astro.config.mjs`](astro.config.mjs) under `env.schema`; read server secrets via `astro:env/server`, public vars via `astro:env/client`.
- UI primitives under `src/components/starwind/` are vendored from Starwind — add via the Starwind CLI rather than editing in place.
