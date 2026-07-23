# Architecture — vws-starter-2026 (EmDash / SSR / Cloudflare)

Target architecture after the Decap → EmDash migration. For *why*, see
[decisions/0001-cms-decap-to-emdash.md](decisions/0001-cms-decap-to-emdash.md).

## Runtime shape

```
Browser
  │
  ▼
Cloudflare Worker  (Astro output:'server' + @astrojs/cloudflare)
  ├── site routes        → Astro pages / SSR + selective getStaticPaths prerender
  ├── /_emdash/admin     → EmDash admin UI
  ├── /_emdash/api/*      → EmDash content/media API
  └── /_emdash/api/mcp   → EmDash MCP server (agent schema + content authoring)
        │
        ├── D1  (binding: DB)     → content (collections, entries, revisions)
        └── R2  (binding: MEDIA)  → uploaded media
```

Local dev swaps D1→SQLite and R2→local filesystem; everything else is identical.

## The two halves

### 1. CMS-agnostic core (reused unchanged)

The value of the starter. None of this knows or cares which CMS feeds it.

- `src/lib/sectionRegistry.ts` — static map of 241 `"group:variant"` → Astro component.
- `src/components/PageRenderer.astro` — iterates `sections[]`, validates, looks up the registry,
  renders `<Component theme data />`.
- `src/pages/[...slug].astro` — resolves a page and hands `sections` to `PageRenderer`.
- `src/components/sections/**` — the 241 section components (read `data`/`theme` props only).
- `src/lib/schema.ts` — JSON-LD builders. Theme system (`src/styles/**`, `starwind.config.json`),
  Starwind UI (`src/components/starwind/**`), forms (`src/lib/forms/**`, `formRegistry.ts`), layouts.

**Contract:** a page is `{ ..., sections: [{ type, theme, data }] }`. `type` is a registry key
(e.g. `"hero:full"`), `theme` is one of the allowed theme tokens, `data` is the section's payload.

### 2. Data + CMS layer (replaced by EmDash)

- **`astro.config.mjs`** — `output: 'server'`, `adapter: cloudflare()`, and the `emdash({...})`
  integration wired with `d1({ binding: 'DB' })` + `r2({ binding: 'MEDIA' })` (prod) or
  `sqlite()` + `local()` (dev).
- **`src/live.config.ts`** — `_emdash` live collection via `emdashLoader()`.
- **Reads** — `getEmDashCollection(slug, { status, limit, where })` and
  `getEmDashEntry(slug, id)` (both return `{ entries|entry, error }`). These replace every
  `getCollection(...)` call (~69 sites) and the `glob`/`file` loaders + Zod schemas in
  `src/content.config.ts`.
- **Types** — `npx emdash types` generates TS interfaces from the EmDash schema.
- **Schema source of truth** — `.emdash/seed.json` (infrastructure-as-code) and/or the admin UI.

## Content model (EmDash collections)

Mirrors the pre-migration collections one-for-one:

| EmDash collection | Was (git) | Notes |
| --- | --- | --- |
| `pages` | `src/content/pages/*.json` | `sections` = **`json` field** (`[{type,theme,data}]`); + title, meta, seo, flags |
| `services` | `services/*.json` | `category` → `reference` to `serviceCategories` |
| `serviceCategories` | `service-categories/*.json` | |
| `serviceAreas` | `service-areas/*.json` | |
| `faqs` | `faqs/*.json` | feeds `FAQPage` JSON-LD |
| `reviews` | `reviews/*.json` | |
| `posts` | `posts/*.md` | body → `portableText` (only markdown collection) |
| settings singletons | `settings/{general,hours,seo,navigation}.json` | EmDash **site settings** / singletons |

Media referenced by string paths in content moves to **R2** (seeded from `.emdash/media/`).

## Why `sections` is a `json` field

`repeater` (EmDash's array field) has fixed sub-fields and isn't documented to hold heterogeneous
block variants; our 241 section shapes are heterogeneous. A `json` field stores the exact array we
already produce, so the registry contract is preserved with zero per-variant remodeling and
`PageRenderer` is untouched. Editor UX for sections is raw JSON initially — a block-editor plugin is
the planned follow-up. See the ADR.

## Rendering strategy

- Default: **SSR** — content resolves per request on the Worker (instant edits).
- Optimization: high-traffic/stable routes may use `getStaticPaths()` + `getEmDashCollection()` to
  prerender at build time; set `export const prerender = false` for always-dynamic routes.

## Backup / IaC

Content lives in D1 (authoritative). `npx emdash export-seed --with-content > .emdash/seed.json`
snapshots collections **and** content to a committable JSON file — this is the version/backup lever
that replaces git-tracked content, and the basis for standing up new sites.
