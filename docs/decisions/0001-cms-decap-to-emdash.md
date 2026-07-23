# ADR 0001 — Move the CMS from Decap to EmDash (SSR on Cloudflare)

- **Status:** Accepted — in progress (branch `emdash-migration`)
- **Date:** 2026-07-17
- **Supersedes:** the earlier "stay on Decap, table EmDash" decision memo.

## Context

`vws-starter-2026` was built as a static Astro 6 starter: git-tracked JSON content
collections → a 241-component **section registry** → `PageRenderer` → `output: 'static'`,
with **Decap CMS** editing the git files through a generated 17.4k-line `public/admin/config.yml`
(produced by `scripts/generate-cms.mjs` from `src/lib/cms/sectionFields.mjs`, parity-gated by
`check:cms`). Auth in production ran through DecapBridge (hosted git-gateway).

We reconsidered the CMS after evaluating **EmDash**, Cloudflare's open-source, Astro-native CMS.
Two capabilities Decap structurally lacks drove the decision:

1. A **real plugin system** (plugin CLI, extension points) for per-client customization.
2. A built-in **MCP server** (~52 tools across content, schema, media, taxonomy, search) that lets
   AI agents **define collections/fields and author content directly** — matching how this shop
   already works with Claude. (The Reddit prompt that surfaced this — "connect the Cloudflare,
   Astro, and EmDash MCP servers and instruct agents to build your schemas/elements" — checks out
   against the docs.)

Combined with an all-in bet on Cloudflare infra, EmDash consolidates the stack.

## Decision

**Re-platform `vws-starter-2026` from Decap → EmDash, targeting a full SSR Cloudflare Worker.**

## What EmDash actually is (research, mid-2026)

- **Database-backed, not git/file-backed.** Content is stored as Portable Text / typed columns in
  **SQL** (Cloudflare **D1**, or SQLite/Postgres/libSQL). There is **no git/file-backed content
  mode**. Content leaves the repo.
- **SSR by default.** The Astro integration **requires `output: 'server'`**; content resolves at
  runtime on a Worker. Static prerender is possible per-page via `getStaticPaths()`, but the
  intended mode is a running Worker. **We accept full SSR** (Cloudflare's recommended shape).
- **Maturity: 0.x preview** (~0.29.0 as of 2026-07). MIT, Cloudflare-backed, fast-moving, breaking
  changes expected. **Mitigation: pin versions.**
- **One instance per site.** No native multi-tenancy — each site is its own Worker + D1 + R2.
- **No Decap→EmDash migration tooling.** We build the importer (existing JSON → EmDash **seed files**).
- **Astro integration:** `emdash/astro`; content via a **live loader** (`emdashLoader()` in
  `src/live.config.ts`) and `getEmDashCollection()` / `getEmDashEntry()`; types via `npx emdash types`.
  Astro collections and EmDash **can coexist** (e.g. keep dev-owned docs in `getCollection`).

## Tradeoffs accepted

| We give up | We gain |
| --- | --- |
| Fully static output | SSR Worker with live/instant edits + dynamic capability |
| Git-versioned content in the repo | DB content + `export-seed --with-content` as the backup/IaC lever |
| The Decap section generator (`config.yml`, `generate-cms.mjs`, `sectionFields.mjs`) | EmDash admin + **plugins** + **MCP** schema/content authoring |
| Zod content schemas as source of truth | EmDash schema (seed files / admin) as source of truth; `npx emdash types` |
| Zero per-site runtime infra | One D1 + R2 (+ Worker) per site — provisioned per client |

## What is preserved (non-negotiable)

The CMS-agnostic core is reused **unchanged**: the 241 section components (`src/components/sections/**`),
the render pipeline (`[...slug].astro` → `PageRenderer.astro` → `sectionRegistry.ts`), the
`{type,theme,data}` contract, JSON-LD (`src/lib/schema.ts`), the theme system, Starwind UI, forms,
and layouts. Only the **data-fetch seam** and the **CMS machinery** change.

## Key design decision — how `sections[]` is modeled

EmDash field types are `string/text/number/date/select/multiSelect/reference/portableText/image/`
**`repeater`** (fixed sub-fields, stored as JSON) / **`json`** (arbitrary JSON). `repeater` is **not**
documented to support polymorphic block variants, and our pages hold **241 heterogeneous** section
shapes. Therefore:

> **`pages.sections` is modeled as a `json` field** holding the exact `[{type,theme,data}]` array.
> This guarantees the 241-variant contract round-trips verbatim and keeps `PageRenderer` untouched.

Cost: editors edit sections as JSON in the admin rather than a rich block UI. **Follow-up (not
blocking):** a nicer section-building UX via a `repeater`/blocks mapping or a custom **EmDash plugin** —
exactly the kind of thing EmDash's plugin system exists for.

## Risks & open questions

- **Section-array UX** — the `json`-field approach is reliable but not editor-friendly; revisit via plugin.
- **0.x churn** — pin versions; expect breaking changes on upgrades.
- **Per-site cost/ops** — one D1 + R2 (+ Worker) per client; model against Cloudflare Workers/D1/R2
  pricing (Workers scale-to-zero helps). Document provisioning in `setup-new-site.md`.
- **Content backup** — DB is authoritative; `export-seed --with-content` is the snapshot/versioning lever.

## Revisit conditions (inherited from the retired memo, still worth watching)

- If EmDash 0.x instability bites production, consider pinning to a known-good release or pausing upgrades.
- If a **file/git-backed content mode** ever ships, reconsider whether content should live in git again.
- If per-site infra cost/ops outweighs the benefit for simple "we build it" sites, consider a
  **use-case split** (static for brochure sites, EmDash for self-service/dynamic) rather than one CMS.
