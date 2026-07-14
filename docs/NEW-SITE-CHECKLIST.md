# New Site Checklist

The mechanical, start-to-launch process for spinning up a client site from this
starter. Follow top to bottom. Every step references a real file — nothing here
is invented. Estimated first-time run: **half a day** once content is gathered.

> Mental model: this repo is an **engine**. A "site" is (1) one reskinned
> `theme.css`, (2) a handful of settings JSON files, (3) content collections,
> (4) a set of page JSON files composed from the section library, (5) real
> assets. You almost never touch `.astro` components — you author JSON.

---

## Phase 0 — Prereqs

- [ ] Node ≥ 22.12 (`node -v`)
- [ ] `npm install`
- [ ] `npm run dev` boots clean at `http://localhost:4321`
- [ ] Skim [SECTION-MANIFEST.md](SECTION-MANIFEST.md) and open `/components` in the
      browser — this is the catalog you compose pages from.

---

## Phase 1 — Clone & name

- [ ] Copy the repo to a new directory, name it `<client>-site`.
- [ ] `rm -rf .git && git init` (fresh history) — or keep history if forking.
- [ ] Update `package.json` `name` field.
- [ ] Update `wrangler.jsonc` `name` (the Cloudflare project/worker name).

---

## Phase 2 — Reskin the theme (the ONE knob)

Everything visual derives from `src/styles/theme.css`. Change values there and the
whole site — every section, every UI primitive, every theme variant — follows. Do
**not** hardcode colors anywhere else.

- [ ] `src/styles/theme.css` — set the brand:
  - [ ] `--t-primary` / `--t-primary-light` / `--t-primary-muted`
  - [ ] `--t-secondary` / `--t-secondary-light` / `--t-secondary-fg`
  - [ ] Neutrals: `--t-bg*`, `--t-fg*`, `--t-bg-inverse`, `--t-fg-inverse`, `--t-border`
  - [ ] `--t-rating` (star color) if brand-specific
  - [ ] Typography: `--t-font-sans`, `--t-font-heading`, `--t-font-weight-heading`
  - [ ] Shape: `--t-radius` (0 sharp → 1rem pill), `--t-border-width`
  - [ ] Elevation: `--t-shadow-sm/md/lg` (soft vs flat vs hard changes the whole feel)
  - [ ] Density: `--t-section*` rhythm (airy vs tight)
- [ ] If loading webfonts, wire them where fonts are registered (BaseLayout) and
      reference the family in `--t-font-*`.
- [ ] Reference: `src/styles/themes/harbor.css` is a complete second palette — copy
      it over `theme.css` as a starting point for a different feel.
- [ ] **Contrast gate:** after reskin, run the QA harness (Phase 10) before building
      pages. A new palette is exactly when dark-on-dark stragglers appear.

---

## Phase 3 — Business identity (settings collection)

`src/content/settings/` — four files, schema-validated in `src/content.config.ts`.

- [ ] `general.json` — `businessName`, `tagline`, `phone`, `email`, `address`,
      `city`, `state`, `zip`, `license`, `gbpUrl`, `social.{facebook,instagram,youtube}`.
- [ ] `general.json` — pick chrome (see Phase 5): `headerVariant`, `footerVariant`.
- [ ] `seo.json` — default title/description/OG for the site.
- [ ] `hours.json` — business hours (feeds `hours` footer + LocalBusiness JSON-LD).

---

## Phase 4 — Navigation

`src/content/settings/navigation.json`.

- [ ] Set top-level `items` (label + href, or `autoPopulate: "services" | "service-areas"`).
- [ ] A dropdown parent with its own page: give it **both** `href` and
      `autoPopulate` — it renders a **"View all X →"** link at the top of the
      submenu and stays tappable on mobile (see the Services item as the model).
- [ ] Confirm every `href` points at a page that exists (Phase 8).

---

## Phase 5 — Chrome (header + footer)

Chosen by name in `general.json`; resolved via `src/lib/layoutRegistry.ts`.

- [ ] `headerVariant` — one of: `classic`, `centered`, `minimal`, `transparent`,
      `inverse`, `two-row`, `pill`, `compact`, `cta-prominent`, `gradient`
- [ ] `footerVariant` — one of: `columns`, `simple`, `cta`, `newsletter`, `map`,
      `mega`, `centered`, `hours`, `social`, `bar`
- [ ] Preview all 20 at `/components/chrome` before deciding.

---

## Phase 6 — Content collections

Replace the Peak Roofing demo data. Directories under `src/content/`:

- [ ] `services/` — one file per service (drives service pages, `services:grid`,
      autoPopulate nav).
- [ ] `service-areas/` — one per city/area served (drives area pages + nav).
- [ ] `reviews/` — testimonials (feeds `reviews:*` sections + Review JSON-LD).
      Third-party source logos (Google/Facebook/Yelp) stay brand-correct — don't
      retheme those.
- [ ] `faqs/` — Q&A (feeds `faq:*` sections + FAQPage JSON-LD).
- [ ] `posts/` — blog posts (optional; delete the collection's demo entries if no blog).

---

## Phase 7 — Assets

- [ ] Drop real images in `src/assets/` and reference them by path string in page
      JSON — the image resolver optimizes them at build.
- [ ] Replace favicon(s) in `public/`.
- [ ] Set a real default OG image (referenced from `seo.json`).
- [ ] Owner/testimonial **videos**: YouTube IDs go in the `reviews:video`,
      `reviews:video-duo`, `about:owner-video` section data — no files needed.

---

## Phase 8 — Compose the pages

`src/content/pages/*.json`. Each page is `{ ..., sections: SectionConfig[] }`;
`[...slug].astro` maps filename → URL; `PageRenderer` renders each section by `type`.

- [ ] Delete/replace demo pages: `roof-repair.json`, `roof-replacement.json`,
      `gutter-installation.json`, `meridian-id-roof-repair.json`, plus `about.json`,
      `contact-us.json`, `services.json`, `index.json`.
- [ ] Build each real page by copying section blocks from `/components` (the live
      catalog) — set each section's `type`, `theme`, and `data`.
- [ ] `theme` per section must be one of: `default`, `alt`, `muted`, `inverse`,
      `primary`, `brand-secondary` (enforced at the content layer — a bad value is a
      hard build error, which is intentional).
- [ ] **Keep or delete the dev-only pages:** `components.json` and
      `section-preview.json` are `noindex` catalogs. Fine to leave (they won't be
      indexed) or delete before launch.
- [ ] **Or compose in the CMS:** `/admin` → Pages → Add Section exposes all 126
      section types (see [CMS.md](CMS.md)). Dev-authored JSON and CMS editing
      produce the identical `{ type, theme, data }` shape — use whichever is faster.
      If you add a brand-new section type, also add its fields to
      `src/lib/cms/sectionFields.mjs` and run `npm run generate:cms`.

---

## Phase 9 — Lead forms

Forms are a **slot in a hero**, selected by `form.type` in the hero's page data.

- [ ] Choose the form per hero: `form.type: "simple"` (single-step contact) or
      `"quiz"` (multi-step diagnostic/prequal — see the roof-repair example on
      `/components`).
- [ ] Author quiz steps in the page JSON (`form.steps[]`) if using a quiz.
- [ ] Set the destination: `form.submit.endpoint` (GHL webhook or any URL),
      optional `form.submit.redirect` (thank-you page) and `hiddenFields`.
- [ ] If no endpoint, the form dispatches a `form:submit` DOM event and shows the
      inline success/outcome — wire the endpoint before launch.
- [ ] Verify the honeypot + submit path once in the browser.

---

## Phase 10 — Flair (per-site, optional)

Flair is intentionally **per-site** for a unique feel — not a shared system yet.

- [ ] Add background shapes / floating elements / cross-section SVG transitions
      directly in that site's components or page CSS as the brand calls for it.
- [ ] Keep flair additive (decorative, `aria-hidden`, behind content) so it never
      breaks the section contract or contrast.

---

## Phase 11 — Validate & QA

- [ ] `npm run build` is green (static output to `dist/`).
- [ ] `npx astro check` passes (types).
- [ ] Walk every page in `npm run dev`. In dev, any broken/unknown section shows a
      red **ErrorShim**; in prod it's silently omitted — so **QA in dev** to catch them.
- [ ] **Contrast sweep** — run the theme QA harness across all 6 section themes +
      the reskinned brand theme, fix any dark-on-dark / light-on-light stragglers.
      *(Harness is the next tool we're building; until then, eyeball `/components`
      in the new theme.)*
- [ ] Mobile: nav opens/closes, dropdowns expand + collapse, "View all" reachable.
- [ ] Real content in every section — no lorem, no `Peak Roofing`, no `(208) 555-*`.

---

## Phase 12 — Deploy (Cloudflare)

- [ ] `wrangler.jsonc` name + account set.
- [ ] Env/secrets set (form endpoint, any keys) in the Cloudflare dashboard.
- [ ] `npm run build` then deploy (`wrangler pages deploy dist` or connected git).
- [ ] Point the domain, verify HTTPS.

---

## Phase 13 — Post-launch

- [ ] Analytics wired and firing.
- [ ] Submit a test lead end-to-end → confirm it lands in GHL.
- [ ] `robots.txt` / sitemap correct; dev-only pages `noindex`.
- [ ] Google Business Profile URL live in `general.json` → LocalBusiness JSON-LD.
- [ ] Redirects for any old URLs if this replaces an existing site.

---

### Quick reference — what lives where

| Need to change… | Edit |
| --- | --- |
| Colors, fonts, radius, shadows, density | `src/styles/theme.css` |
| Business name / phone / address / socials | `src/content/settings/general.json` |
| Header & footer style | `headerVariant` / `footerVariant` in `general.json` |
| Nav menu | `src/content/settings/navigation.json` |
| SEO defaults | `src/content/settings/seo.json` |
| Hours | `src/content/settings/hours.json` |
| Services / areas / reviews / FAQs / posts | `src/content/<collection>/` |
| A page's sections | `src/content/pages/<slug>.json` |
| Which form a hero shows + where leads go | `form.type` + `form.submit` in the page JSON |
| Images | `src/assets/` (referenced by path in page JSON) |
| Add a brand-new section type | `src/lib/sectionRegistry.ts` (import + key) + `src/lib/cms/sectionFields.mjs`, then `npm run generate:cms` |
| Make sections editable in `/admin` | Already generated — see [CMS.md](CMS.md) |
