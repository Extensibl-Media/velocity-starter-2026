# Deploying & Hosting on Cloudflare

How to deploy this starter as a production **Cloudflare Worker** (SSR) backed by
**D1** (content) and **R2** (media). This is the hosting-specific companion to
[setup-new-site.md](setup-new-site.md) (which covers the full new-site flow) and
[architecture.md](architecture.md) (the target stack). Read the live EmDash docs
first — https://docs.emdashcms.com/deployment/cloudflare/ — EmDash is 0.x and pins matter.

> **Why a Worker, not Pages/static:** EmDash is DB-backed and edits happen at runtime
> in `/_emdash/admin`, so content routes are server-rendered (`output: 'server'`).
> Each site is its **own** Worker + D1 + R2 — no multi-tenancy.

---

## What gets deployed

```
Cloudflare Worker (this Astro app, SSR)
├── D1   binding vws_starter_2026_db     → content, schema, menus, taxonomies, native SEO, widgets
├── R2   binding vws_starter_2026_media  → uploaded media (images/files)
├── ASSETS binding                       → static assets (adapter serves dist/client)
└── (optional) KV CACHE → object cache · EMAIL → magic-link login · cron → scheduling
```

Already wired in this repo — you don't need to change code, only provision resources
and fill in ids/secrets:

- [astro.config.mjs](../astro.config.mjs) — `adapter: cloudflare()`, `emdash({ database: d1({binding:'vws_starter_2026_db'}), storage: r2({binding:'vws_starter_2026_media'}), plugins:[sectionBuilder()] })`.
- [wrangler.jsonc](../wrangler.jsonc) — bindings for `vws_starter_2026_db`, `vws_starter_2026_media`, `ASSETS`; `nodejs_compat` + `global_fetch_strictly_public` flags; observability on.
- **Binding names are matched in both files** — if you rename a binding, change it in
  `wrangler.jsonc` *and* `astro.config.mjs`. (`@astrojs/cloudflare` generates a
  redirected `dist/server/wrangler.json` at build; that's the config `wrangler deploy`
  actually uses, and it scopes public assets to `dist/client` — so a stray file under
  `dist/server/` is not served publicly.)

---

## Prerequisites

- Node ≥ 22.12, `npm install`
- Cloudflare account on the **Workers Paid ($5/mo)** plan (D1 + R2 + cron need it)
- `wrangler login`
- A generated `EMDASH_ENCRYPTION_KEY` (below)

---

## 1. Provision D1 + R2

```sh
# Content database
wrangler d1 create vws-starter-2026-db
#   → copy the printed database_id

# Media bucket
wrangler r2 bucket create vws-starter-2026-media
```

> Rename `vws-starter-2026*` to your site slug for a client site. Keep the Worker
> `name`, D1 `database_name`, and R2 `bucket_name` consistent across the three files
> (`wrangler.jsonc`, `package.json`, this doc).

## 2. Fill in `wrangler.jsonc`

The bindings exist already — replace the **placeholder `database_id`** with the real
id from step 1:

```jsonc
"d1_databases": [
  {
    "binding": "vws_starter_2026_db",
    "database_name": "vws-starter-2026-db",
    "database_id": "PASTE-REAL-ID-HERE"   // was "local-dev-placeholder"
  }
],
"r2_buckets": [
  { "binding": "vws_starter_2026_media", "bucket_name": "vws-starter-2026-media" }
]
```

Binding names (`vws_starter_2026_db`, `vws_starter_2026_media`) **must** match
`astro.config.mjs` exactly — they're how the EmDash integration finds the database and
bucket. Rename in both files together if you change them.

> Optionally regenerate types after editing bindings: `npm run generate-types`.

## 3. Secrets

```sh
npx emdash secrets generate          # prints EMDASH_ENCRYPTION_KEY=emdash_enc_v1_...
wrangler secret put EMDASH_ENCRYPTION_KEY   # paste the value
```

- **Back up this key** (password manager). Losing it means losing all encrypted
  plugin secrets — it is not recoverable and must never be committed.
- Optional stable overrides (only if you need identical values across deploys):
  `EMDASH_PREVIEW_SECRET`, `EMDASH_AUTH_SECRET`, `EMDASH_IP_SALT` — otherwise EmDash
  auto-derives them.

## 4. Environment variables (`astro:env`)

This project reads env through the typed `astro:env` schema in `astro.config.mjs`.
Set them as Worker vars/secrets (dashboard → Worker → Settings → Variables, or
`wrangler secret put` / `[vars]`):

| Var | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | **Yes** | Canonical/sitemap/robots/JSON-LD base. The build **warns loudly** if unset and falls back to `https://example.com`. Set to the final domain. |
| `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_GTM_ID` | optional | Analytics |
| `PUBLIC_PLAUSIBLE_*`, `PUBLIC_UMAMI_*` | optional | Privacy analytics |
| `PUBLIC_FORM_ADAPTER`, `PUBLIC_FORM_ENDPOINT` | optional | Contact/newsletter form target (GHL webhook, etc.) |
| `PUBLIC_GHL_CHAT_WIDGET_ID`, `PUBLIC_GHL_LOCATION_ID` | optional | GoHighLevel chat/location |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | optional | Map embeds |
| `PUBLIC_META_PIXEL_ID`, `PUBLIC_GOOGLE_ADS_ID`, `PUBLIC_TIKTOK_PIXEL_ID` | optional | Ad pixels (consent-gated) |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | optional | Search-console verification (also settable via the native Site Settings SEO panel) |

**`SITE_URL` is a *build-time* input read from the shell `process.env`, and it is
baked into the app's `site` (canonical/sitemap/robots/OG/JSON-LD).** Two consequences
that trip people up:

- **It is NOT read from `.env`.** The repo's `.env` sets `SITE_URL=http://localhost:4321`
  for *local dev only* (EmDash admin/login redirects, `wrangler dev`). Astro exposes that
  to runtime (`import.meta.env`), **not** to `process.env` at config eval — so it does
  **not** leak into a production build. (Verify: `npm run build` with that `.env` present
  still warns "SITE_URL is not set" and uses `example.com`.)
- **`wrangler deploy` does not read `SITE_URL`** — it only uploads the already-built
  `dist/`. So the value that ships is whatever was in your shell when you ran
  `npm run build`.

Deploying from your laptop, set it inline for the build (this does not change your `.env`
or your `npm run dev` setup):

```sh
SITE_URL=https://vws-starter-2026.extensiblmedia.workers.dev npm run build
wrangler deploy
```

## 5. Build & deploy

```sh
SITE_URL=https://your-domain.com npm run build
wrangler deploy
#   → https://vws-starter-2026.<your-subdomain>.workers.dev
```

On the **first request** after deploy, EmDash automatically:

1. runs pending D1 **migrations**, then
2. **applies the seed** if the DB is empty. The seed is read from `.emdash/seed.json`
   and **inlined into the bundle at build time** — so any seed change (new section
   defaults, menus, demo content) requires a **rebuild + redeploy** to take effect.

## 6. First admin login

Visit `https://<your-worker>/_emdash/admin`. EmDash prompts you to create the first
admin (passkey or email magic-link). Magic-link requires email to be configured
(step 9); until then use a **passkey**, or in a throwaway/dev context the dev bypass
`/_emdash/api/setup/dev-bypass` (never in production).

The MCP endpoint for agent-driven schema/content work is at `/_emdash/api/mcp`.

## 7. Page-level SEO after deploy

Native per-page SEO lives in EmDash's `_emdash_seo` store, which **seeds cannot carry**
(`SeedContentEntry` has no `seo` field) and `export-seed` does not include. So on a
fresh production DB, pages fall back to their title/description via `getSeoMeta`.

- **Recommended (native):** set per-page title/description/OG/canonical in each page's
  **SEO panel** in `/_emdash/admin` after deploy.
- The repo's [dev-apply-page-seo](../src/pages/dev-apply-page-seo.json.ts) route (which
  re-applies `.emdash/pages-seo.json` after a local reseed) is **dev-only (403 in prod)**
  by design and is not part of the production flow.

## 8. Custom domain

Cloudflare dashboard → **Workers & Pages** → your Worker → **Custom Domains** →
**Add Custom Domain**. After DNS propagates, set `SITE_URL` to that domain and
redeploy so canonical/sitemap/OG are correct.

## 9. Recommended & optional add-ons

### R2 public media (recommended)

Serve uploads straight from R2 instead of proxying through the Worker:

1. Dashboard → **R2** → your bucket → **Settings** → enable **Public access** (or attach
   a custom domain to the bucket).
2. Add the public URL to `astro.config.mjs`:
   ```js
   storage: r2({ binding: 'vws_starter_2026_media', publicUrl: 'https://pub-xxxx.r2.dev' }),
   ```

### Scheduled publishing (if you use embargoed/scheduled content)

Without a cron trigger, content scheduled in the admin **never publishes** in
production (it silently no-ops; `astro dev` still works locally). Enable it:

1. Add `src/worker.ts`:
   ```ts
   export { default, PluginBridge } from "@emdash-cms/cloudflare/worker";
   ```
2. Add a trigger to `wrangler.jsonc`:
   ```jsonc
   "triggers": { "crons": ["* * * * *"] }
   ```

### KV object cache (reduce D1 load)

```jsonc
"kv_namespaces": [{ "binding": "CACHE", "id": "<kv-id>" }]
```
```js
import { kvCache } from "@emdash-cms/cloudflare";
emdash({ database: d1({binding:'vws_starter_2026_db'}), storage: r2({binding:'vws_starter_2026_media'}), objectCache: kvCache({ binding: 'CACHE' }), plugins:[sectionBuilder()] })
```

### Email (magic-link login, invites, notifications)

```jsonc
"send_email": [{ "name": "EMAIL" }]
```
```js
import { cloudflareEmail } from "@emdash-cms/cloudflare/plugins";
// inside emdash({ plugins: [ sectionBuilder(), cloudflareEmail({ from:{email:'cms@mails.your-domain.com', name:'Site CMS'}, replyTo:'hello@your-domain.com', binding:'EMAIL' }) ] })
```
Then verify the sender domain (dashboard → **Email**) and activate the plugin under
**Admin → Extensions**.

### Preview/staging environment

```jsonc
"env": { "preview": { "d1_databases": [{ "binding": "vws_starter_2026_db", "database_name": "vws-starter-2026-db-preview" }] } }
```
```sh
wrangler deploy --env preview
```

---

## Gotchas (read before shipping)

1. **`global_fetch_strictly_public` ⚠ do NOT enable D1 read replicas.** This repo sets
   that compat flag ([wrangler.jsonc](../wrangler.jsonc)); combined with read replicas,
   requests **hang silently** with no error or log. Leave replicas off.
2. **Encryption key is unrecoverable.** Back up `EMDASH_ENCRYPTION_KEY`; rotating/losing
   it discards all encrypted plugin secrets.
3. **Seed is inlined at build time.** Editing `.emdash/seed.json` requires a rebuild +
   redeploy; it does not hot-apply. (Live *content* edits in the admin are unaffected.)
4. **Binding names must match** across `wrangler.jsonc` and `astro.config.mjs` (`vws_starter_2026_db`, `vws_starter_2026_media`).
5. **Edge cache + logged-in editors.** If you enable Cloudflare's edge cache, responses
   without a `Cache-Control` header are still cached heuristically (~2h), so editors may
   see anonymous cached pages without the editing toolbar. Scope caching accordingly.
6. **`SITE_URL`.** Deploying without it ships `https://example.com` in canonical/sitemap/
   JSON-LD. The build prints a warning — don't ignore it.

## Moving real content between environments

Content lives in **D1, not git**. Author directly in the target environment's admin, or
snapshot from a source site:

```sh
npx emdash export-seed --with-content > .emdash/seed.json   # on the source
# rebuild + redeploy the target to inline & apply it on an empty DB
```

Note: `export-seed` carries collections/content/menus/taxonomies/settings, **not** native
per-page SEO (see §7) — re-set those in the target admin.

## Troubleshooting

- `wrangler tail` — live logs / underlying errors from the deployed Worker.
- Blank site / 404s on content → the DB was empty and the seed hasn't applied; hit any
  page once, then check `/_emdash/admin`.
- Media 404s → confirm the R2 bucket exists and `vws_starter_2026_media` binding matches; check public URL.
- Verify: edit in `/_emdash/admin` → change appears on the live site; `/_emdash/api/mcp`
  reachable.

## Deploy checklist

- [ ] `wrangler d1 create` + `wrangler r2 bucket create` done; `database_id` pasted into `wrangler.jsonc`
- [ ] `EMDASH_ENCRYPTION_KEY` generated, `wrangler secret put`, backed up
- [ ] `SITE_URL` set for the build; app env vars/pixels/forms configured
- [ ] `npm run build` (no `SITE_URL` warning) → `wrangler deploy`
- [ ] First admin created at `/_emdash/admin`; seed applied (collections present)
- [ ] Custom domain attached; `SITE_URL` updated + redeployed
- [ ] (Optional) R2 public access, cron + `src/worker.ts`, KV cache, email plugin
- [ ] Page SEO set in the admin panels (§7)
- [ ] `npx emdash export-seed --with-content` produces a clean backup
