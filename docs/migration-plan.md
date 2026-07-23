# Migration Plan & Progress — Decap → EmDash

Executable checklist for the re-platform. Branch: `emdash-migration`.
Rationale: [decisions/0001-cms-decap-to-emdash.md](decisions/0001-cms-decap-to-emdash.md) ·
Target: [architecture.md](architecture.md).

**Rule:** read https://docs.emdashcms.com before each EmDash-touching phase; pin versions (0.x).

## Phase 0 — Documentation foundation ✅ (in progress → done when this commits)
- [x] `CLAUDE.md` (scope, migration goal, target arch, "read live docs" rule)
- [x] `docs/decisions/0001-cms-decap-to-emdash.md` (ADR)
- [x] `docs/architecture.md`
- [x] `docs/setup-new-site.md`
- [x] `docs/migration-plan.md` (this file)
- [x] Update project memory to record the reversal (Decap→EmDash)

## Phase 1 — Scaffold EmDash + SSR runtime ✅
- [x] Installed: `emdash@0.29`, `@emdash-cms/cloudflare@0.29`, `@astrojs/cloudflare@14` — **required Astro 6→7 upgrade**
      (adapter peer = astro ^7); also `@astrojs/react` + `react`/`react-dom` (EmDash admin is React),
      `@astrojs/markdoc@2`, `kysely`, `pg`, `@emdash-cms/auth-atproto`
- [x] `astro.config.mjs`: `output: 'server'`, `adapter: cloudflare()`, `emdash({ database: d1, storage: r2 })`
      — **D1/R2 for BOTH dev and prod** (dev runs under the adapter's workerd emulation → miniflare-local
      D1/R2; there is NO Node-native SQLite dev path — better-sqlite3 can't load in workerd). Fixed dup tailwind import.
- [x] `src/live.config.ts`: `_emdash` via `emdashLoader()`
- [x] `wrangler.jsonc`: added `nodejs_compat` + D1 (`DB`) + R2 (`MEDIA`) bindings (`database_id` = local placeholder → real in Phase 6)
- [x] `npx emdash secrets generate` → `EMDASH_ENCRYPTION_KEY` in `.env` (gitignored); `.gitignore` += `.wrangler/`, `.emdash/data.db*`, `dev.log`
- [x] Boots locally: site `/` + `/services/*` → 200 (interim `prerender=true` on `[...slug]` + `blog/[slug]`);
      `/_emdash/admin` → 200 w/ dev-bypass session; `/_emdash/api/mcp` → 401 (auth-gated, healthy)
- [ ] (minor follow-up) bump `wrangler` 4.77 → ^4.83 to satisfy adapter peer (works on 4.77; non-blocking)

## Phase 2 — Model content types  ⟵ RISK CHECKPOINT ✅ PASSED
- [x] `pages` collection defined in `.emdash/seed.json` via `scripts/build-seed.mjs` (converter, reused/extended in Phase 3).
      Field slugs must be **snake_case** (`meta_title`, `meta_description`).
- [x] `pages.sections` = **`json` field** (confirmed necessary: `repeater` sub-fields are primitives only, can't hold
      the 241 heterogeneous `{type,theme,data}` variants). `seo` also `json`.
- [x] Seeded 19 pages into D1. **Seeding mechanism (local):** hit `/_emdash/api/setup/dev-bypass` — it runs
      `applySeed(loadSeed(), { includeContent })` against the dev D1. `onConflict:"skip"`, so wipe `.wrangler/state`
      for a clean apply. `npx emdash seed` writes a *file* sqlite, NOT the dev D1 — don't use it for dev.
- [x] `npx emdash types` → `emdash-env.d.ts` `Page` type generated from the DB schema (exactly our fields).
- [x] **CHECKPOINT PASSED:** `/emdash-proof/[...slug]` (temp SSR route) reads `getEmDashCollection("pages")` →
      `data.sections` returns as the **identical `{type,theme,data}` array** (raw probe verified byte-for-byte);
      privacy-policy rendered **607KB through the UNCHANGED `PageRenderer` + section components** from D1.
      The 241-variant section model round-trips and renders unchanged. **Approach validated — Phase 4 unblocked.**

### Deferred issues surfaced here (NOT sections problems)
- **Build-time image assets** (`/src/assets/...` in `hero:image-overlay`, etc.) resolve at build (prerender) but throw
  under SSR at request time → **Phase 3** (media → R2) + image handling in **Phase 4**.
- **`MarketingLayout`/`BaseLayout` chrome emits empty under SSR** (swallowed streaming error in Header/Footer/Analytics/
  ConsentBanner — NOT BaseLayout's head, which has no build-only patterns; bare-shell render of the same sections works).
  Run this down in **Phase 4** when converting `[...slug].astro` to SSR + EmDash + MarketingLayout.
- Temp artifact to remove in Phase 4: `src/pages/emdash-proof/[...slug].astro`.

## Phase 3 — Content importer (git JSON → seed → D1) ✅
- [x] `scripts/build-seed.mjs` converts every collection → `.emdash/seed.json` (8 collections + fields + entries).
      **Verified counts in D1:** pages 19, services 9, categories 3, areas 6, faqs 5, reviews 4, posts 1, settings 4.
- [x] Modeling decisions: `services.category` = **string slug** (matches slug-based grouping; `reference` dropdown is a
      later UX upgrade); settings singletons → a **`settings` collection**, whole payload in a `value` json field;
      posts markdown body → `text` field (portableText later).
- [x] **Menus retrofit (EmDash native):** nav skeleton → EmDash `primary` menu (+ `footer-legal`), items link to pages
      by **reference** (resolved URLs verified via `getMenu`). The two dynamic dropdowns (Services, Service Areas) stay
      render-time — flagged with a `cssClasses` marker `nav-autopopulate:<kind>` the header reads to fill children from
      the collections. Hybrid = editor-managed skeleton + live SEO dropdowns. **Header wiring = Phase 4.**
- [x] **Media:** the 3 baked-in demo images copied to `public/images/`; seeded content rewritten `/src/assets/images/` →
      `/images/` (SSR-safe static assets via the ASSETS binding). Editor-uploaded media still → R2 via EmDash `image` fields.
      **This also resolved the Phase 2 image-under-SSR issue** — the image-heavy roof-repair page renders from D1 (641KB).
- Local seeding: wipe `.wrangler/state` → restart → hit `/_emdash/api/setup/dev-bypass` (runs `applySeed` w/ content).

## Phase 4 — Rewire data reads + FULL CONFORMANCE ✅
- [x] **Adapter** `src/lib/content.ts` wraps the EmDash live API and returns component-shaped data.
      69-file codemod swapped every `getCollection("x")` → `getX()`. `sectionRegistry.ts` + `PageRenderer.astro`
      + all 241 components untouched. `[...slug].astro` + `blog/[slug].astro` now SSR from EmDash (branded 404 via rewrite).
- [x] **Header/Footer chrome** wired to the EmDash `primary` menu (`getResolvedNav` → `getMenu`), with the two
      dynamic dropdowns (services, area→location tree) filled live via the `nav-autopopulate` markers.
- [x] **Conformed to EmDash idioms (not a dump):**
      - `services.category` → **reference** → service_categories (adapter resolves translationGroup → slug)
      - `faqs.service` / `reviews.service` → **`topics` taxonomy** (adapter reads `data.terms.topics[0].slug`)
      - `reviews.date`, `posts.date` → **datetime**; `reviews.source` → **select** (Google/Facebook/Yelp/Direct)
      - `posts.author` → **byline**; `posts.body` → **portableText** (blog renders via `emdash/ui` `PortableText`)
      - restored dropped `faqs.service` + `services.{metaTitle,metaDescription,image}` (real data-loss fixes)
- [x] **Header/Footer picker = CMS setting, not code:** new **`appearance`** singleton with `select` fields
      (`header_variant`, `footer_variant`) → admin dropdowns; layouts read `getAppearance()`. (Was `general.headerVariant` string.)
- [x] Removed interim `prerender=true`; deleted proof/probe routes.
- [x] **Verified:** `astro check` = **0 errors / 0 warnings**; production **Cloudflare SSR Worker build succeeds**;
      broad page sweep (home/about/contact/services×3/legal×3/blog) all 200; unknown route → 404.
- Note: git collections in `content.config.ts` are now dormant (unused by reads) — removed in Phase 5.

## Phase 5 — Retire Decap ✅
- [x] Deleted `public/admin/` (config.yml), `src/pages/admin.astro`, `scripts/generate-cms.mjs`, `src/lib/cms/`
- [x] Removed `decap-server` dep + `generate:cms`/`check:cms`/`cms` scripts; `validate` repointed; added `seed` script. `npm prune`d.
- [x] Decoupled `scripts/wire-variants.mjs` from the deleted CMS manifest (keeps registry + demo scaffolding).
- [x] Deleted superseded `docs/CMS.md` + `docs/NEW-SITE-CHECKLIST.md`; updated `CLAUDE.md`, `README.md`, `SECTION-MANIFEST.md`, `sectionSchemas.ts` comments.
- [x] **Decision:** kept `src/content.config.ts` git collections as the **seed source** (validated at build), NOT runtime reads.
- [x] Verified: `astro check` 0/0, SSR Worker build succeeds, site renders. (Dev-server Vite cache cleared after prune.)

## Phase 6 — Deploy to Cloudflare
- [ ] `wrangler d1 create` + `wrangler r2 bucket create`; fill bindings + `database_id`
- [ ] `wrangler secret put EMDASH_ENCRYPTION_KEY`; `npm run build`; `wrangler deploy`
- [ ] Live edit in `/_emdash/admin` reflects on the deployed site

## Phase 7 — Verify E2E + new-site playbook
- [ ] Migrated collections render identically to the pre-migration static site
- [ ] Agent creates a collection + typed field and authors an entry **via the EmDash MCP**
- [ ] Dry-run `setup-new-site.md` to stand up a second site
- [ ] `validate` passes on the new pipeline; no Decap artifacts remain
