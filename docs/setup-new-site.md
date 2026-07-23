# Setting Up a New Site (EmDash era)

How to stand up a new client site from this starter once the migration is complete.
Supersedes the Decap-era [NEW-SITE-CHECKLIST.md](NEW-SITE-CHECKLIST.md).

> Model: this repo is an **engine**. A site = one reskinned `theme.css` + settings +
> content (now in EmDash/D1, seeded from `.emdash/seed.json`) + page compositions from the
> 241-section library. Each site is its **own Cloudflare Worker + D1 + R2**.

## Prereqs

- Node ≥ 22.12, `npm install`
- Cloudflare account with **Workers Paid ($5)** plan, `wrangler login`
- Read https://docs.emdashcms.com (EmDash is 0.x — pin versions)

## 1. Clone & rename

- Copy the starter, set `name` in `wrangler.jsonc` and `package.json` to the site slug.
- Reskin `src/styles/theme.css` (brand palette) and fill site settings.

## 2. Provision Cloudflare resources

```sh
# D1 (content)
wrangler d1 create <site>-db
# → copy the returned database_id into wrangler.jsonc

# R2 (media)
wrangler r2 bucket create <site>-media
```

Wire the bindings in `wrangler.jsonc`:

```jsonc
{
  "name": "<site>",
  "compatibility_date": "2026-03-17",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [{ "binding": "DB", "database_name": "<site>-db", "database_id": "<id>" }],
  "r2_buckets":   [{ "binding": "MEDIA", "bucket_name": "<site>-media" }]
}
```

> The EmDash Astro integration binds `d1({ binding: 'DB' })` + `r2({ binding: 'MEDIA' })` in
> `astro.config.mjs`. Local dev falls back to SQLite + local files automatically.

## 3. Secrets

```sh
npx emdash secrets generate            # prints EMDASH_ENCRYPTION_KEY=emdash_enc_v1_...
wrangler secret put EMDASH_ENCRYPTION_KEY   # paste it
```

Optional stable overrides if needed: `EMDASH_PREVIEW_SECRET`, `EMDASH_AUTH_SECRET`, `EMDASH_IP_SALT`.
Also set any app env (analytics, forms, pixels) as before.

## 4. Seed schema + starter content

The starter ships a `.emdash/seed.json` (collections, fields, taxonomies, menus, settings, and
demo content). Seeds apply **automatically on first request when the DB is empty**, or explicitly
via `applySeed()` / the CLI. Confirm collections exist in `/_emdash/admin` after first boot.

To start from an existing site's content instead, snapshot it:

```sh
npx emdash export-seed --with-content > .emdash/seed.json   # on the source site
```

## 5. Local run

```sh
npm run dev        # EmDash admin at /_emdash/admin (local SQLite)
```

Author content, compose pages from the section library (`/components` catalog +
[SECTION-MANIFEST.md](SECTION-MANIFEST.md)). `sections` are stored as JSON per page.

## 6. Deploy

```sh
SITE_URL=https://<domain> npm run build
wrangler deploy    # → https://<site>.<subdomain>.workers.dev
```

DB migrations + seed run automatically on first request. Point the custom domain in the
Cloudflare dashboard.

> **Full hosting guide:** provisioning, bindings, secrets, custom domains, R2 public
> media, cron/scheduling, KV cache, email, and gotchas live in
> [deployment-cloudflare.md](deployment-cloudflare.md).

## 7. Verify

- [ ] Site renders from EmDash content (spot-check pages/services/areas/faqs/reviews).
- [ ] Edit in `/_emdash/admin` → change appears on the site.
- [ ] MCP reachable at `/_emdash/api/mcp` (for agent-driven schema/content work).
- [ ] `npx emdash export-seed --with-content` produces a clean backup.

## Scheduled publishing (optional)

If the site uses scheduled/embargoed content, add `src/worker.ts`:

```ts
export { default, PluginBridge } from "@emdash-cms/cloudflare/worker";
```

and a cron trigger in `wrangler.jsonc` (`"triggers": { "crons": ["* * * * *"] }`).
