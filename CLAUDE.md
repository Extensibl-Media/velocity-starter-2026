# CLAUDE.md — vws-starter-2026

Guidance for Claude Code when working in this repo. Project-specific; the parent
workspace [../CLAUDE.md](../CLAUDE.md) still describes the *pre-migration* shape of
this project — **this file supersedes it for anything CMS/rendering-related.**

## What this project is

A **config-driven, JSON-composed local-services website starter**. A "site" is data,
not code: you reskin one `theme.css`, fill in a few settings, author content, and
compose pages from a library of **241 section components** via a static **section
registry**. You almost never touch `.astro` components — you author content.

The render contract is the heart of the project and is **CMS-agnostic**:

```
content (pages)  →  sections: [{ type, theme, data }]
                 →  src/components/PageRenderer.astro
                 →  src/lib/sectionRegistry.ts  (241 "group:variant" → Component)
                 →  rendered HTML
```

Any CMS that can produce that `sections[]` JSON drives the site unchanged.

## Current status: MID-MIGRATION (Decap → EmDash)

**Branch: `emdash-migration`.** This project is being re-platformed from **Decap CMS
+ static output** to **EmDash (Cloudflare's DB-backed, Astro-native CMS) + SSR Worker**.

- **Why:** consolidate on an all-Cloudflare stack, and gain two things Decap lacks — a
  real **plugin system** and a built-in **MCP server** that lets AI agents define
  schemas and author content directly.
- **Full rationale, tradeoffs, and research:** [docs/decisions/0001-cms-decap-to-emdash.md](docs/decisions/0001-cms-decap-to-emdash.md).
- **Target architecture:** [docs/architecture.md](docs/architecture.md).
- **The migration checklist (where we are):** [docs/migration-plan.md](docs/migration-plan.md).
- **Standing up a new site (EmDash era):** [docs/setup-new-site.md](docs/setup-new-site.md).

**Decap is fully removed** (Phase 5): no `public/admin/`, `scripts/generate-cms.mjs`, `src/lib/cms/`,
`src/pages/admin.astro`, or `decap-server`. Editing happens in the EmDash admin at `/_emdash/admin`.
The git collections in `src/content.config.ts` are no longer read at runtime — they are the **seed
source** (`scripts/build-seed.mjs` → `.emdash/seed.json` → D1) and their Zod schemas validate the
default content at build. Runtime reads go through `src/lib/content.ts` (the EmDash adapter).

## Target architecture (short form)

- **Astro 6, `output: 'server'`** with `@astrojs/cloudflare` adapter → a Cloudflare Worker.
- **EmDash** embedded via `emdash/astro`: admin at `/_emdash/admin`, API at `/_emdash/api`,
  MCP at `/_emdash/api/mcp`.
- **Storage:** Cloudflare **D1** (content, via `d1()` from `@emdash-cms/cloudflare`) + **R2**
  (media, via `r2()`). Local dev uses SQLite (`emdash/db` `sqlite()`) + local file storage.
- **Content reads:** the EmDash **live loader** (`src/live.config.ts`, `emdashLoader()`) and
  `getEmDashCollection()` / `getEmDashEntry()` from `emdash` — these **replace** Astro's
  `glob`/`file` loaders and the Zod schemas in `src/content.config.ts`.
- **The section registry, PageRenderer, all 241 section components, JSON-LD (`schema.ts`),
  theme system, Starwind UI, forms, and layouts are reused unchanged.**
- **Pages `sections` are stored as a `json` field** in EmDash — the exact `[{type,theme,data}]`
  array — so the 241-variant contract round-trips verbatim. A richer block-editing UX is a
  documented follow-up (see the ADR).

## Working rule: read the live EmDash docs first

EmDash is **0.x preview** (~0.29 as of mid-2026) — training data is thin and APIs churn.
Before writing or changing EmDash code, consult the live docs at **https://docs.emdashcms.com**
(and the running instance's docs MCP). **Pin versions.** Treat this like the mission-control
"read the real docs before coding" rule.

## Commands

```sh
npm run dev          # astro dev (local EmDash on SQLite once Phase 1 lands)
npm run build        # astro build → Cloudflare Worker bundle
npm run preview      # wrangler dev / astro preview
npx astro check      # type-check
npx emdash types     # regenerate TS types from the EmDash schema
npx emdash secrets generate   # EMDASH_ENCRYPTION_KEY
npx emdash export-seed --with-content > .emdash/seed.json   # backup/IaC snapshot
wrangler deploy      # deploy the Worker (after D1 + R2 provisioned)
```

Deploy prerequisites, bindings, and secrets: see [docs/setup-new-site.md](docs/setup-new-site.md).

## Conventions

- Server-only/secret-bearing modules live under `src/lib/`; never import them from a client island.
- Don't edit `node_modules/`, `dist/`, `.astro/`, `.wrangler/`.
- Adding a section variant still means importing it in `src/lib/sectionRegistry.ts` and adding
  the `"group:variant"` key — dynamic imports don't work for Astro components.
- Content now lives in **D1, not git**. `npx emdash export-seed --with-content` is the
  backup/version lever — snapshot it before risky content changes.
