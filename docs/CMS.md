# Decap CMS — section editing

The `/admin` dashboard (Decap CMS) edits this site's content. As of the section
generator, **every one of the 126 section types is editable in the CMS** — an
editor can compose a page section-by-section, not just edit flat collections.

## Backend & running locally

There are **two backends**, and Decap picks one automatically:

| Where | Backend | Auth | Writes to |
| --- | --- | --- | --- |
| Production (`*.pages.dev` / your domain) | **git-gateway via DecapBridge** | DecapBridge login (hosted OAuth/PKCE) | remote GitHub repo `Extensibl-Media/velocity-starter-2026` @ `master` |
| Local (`localhost`) | **local_backend proxy** | none | your working-copy files on disk |

### Why you can't run the DecapBridge auth on localhost

DecapBridge is a **hosted** auth service (`auth.decapbridge.com` + `gateway.decapbridge.com`). Its PKCE flow is registered to the production `site_url` and a bridge site-id, so the login popup's allowed origin is your prod domain, not `localhost`. And even if you whitelisted a localhost origin in the DecapBridge dashboard, git-gateway **commits to the remote GitHub repo** — it never touches your local files. So bridge-auth-on-localhost is both blocked by origin and pointless for local editing.

### The right way to edit locally — `local_backend`

Decap ships a local mode that skips auth entirely and reads/writes your filesystem through a tiny proxy. It's enabled here (`local_backend: true` at the top of `config.yml`).

```sh
# terminal 1 — the site
npm run dev            # http://localhost:4321

# terminal 2 — the Decap filesystem proxy (port 8081)
npm run cms            # decap-server, must run from the repo root

# then open
http://localhost:4321/admin
```

Decap detects the proxy on `localhost:8081` and edits files directly — no login, no GitHub, changes land in `src/content/**` where you can review the diff and commit yourself. `local_backend: true` is **safe to leave committed**: in production there's no proxy, so Decap falls back to the DecapBridge git-gateway backend above. (`decap-server` is a `devDependency`; the proxy reports `type: local_fs` when running.)

This local mode is also the fastest way to smoke-test the generated **Sections** editor (all 126 types) before trusting it in production.

## What's editable in `/admin`

| Area | Source | Editable |
| --- | --- | --- |
| Business info, hours, SEO, navigation | `src/content/settings/*.json` | ✅ hand-configured |
| Services, service areas, reviews, FAQs, posts | `src/content/<collection>/` | ✅ hand-configured |
| **Pages + their sections** | `src/content/pages/*.json` | ✅ **generated** |

A page in Decap is: slug/title/meta/flags **+ a Sections list**. The Sections list
is a Decap *variable-type* widget — "Add Section" shows all 126 types; each type
exposes exactly the fields that section reads.

## The generator (single source of truth)

The `sections` field in `public/admin/config.yml` is **generated**, never
hand-edited. It is regenerated from a field manifest so the CMS can never drift
from the components.

```
src/lib/cms/fields.mjs         field vocabulary + reusable fragments
                               (mirror src/types/sections.ts shapes)
src/lib/cms/sectionFields.mjs  the manifest: every section type → its fields
scripts/generate-cms.mjs       emits the Decap variable-type list, splices it
                               into config.yml between the GENERATED markers
```

```sh
npm run generate:cms   # regenerate the sections block in config.yml
npm run check:cms      # CI: fail if config.yml is stale (run in validate/CI)
```

The generator **asserts key-parity with the section registry**
(`src/lib/sectionRegistry.ts`): if you add a section type to the registry but not
the manifest (or vice-versa) it exits non-zero and names the offenders. So the
loop when adding a new section is always:

1. Build the component, register it in `sectionRegistry.ts`.
2. Add its field entry to `src/lib/cms/sectionFields.mjs` (compose from fragments).
3. `npm run generate:cms`.

If you skip step 2, `check:cms` (and the generator) fail loudly — the CMS stays
in sync for **all** components, not a subset.

## How a section maps to JSON

Each Decap section round-trips to the exact page-JSON shape the renderer expects:

```json
{ "type": "hero:split-form", "theme": "inverse", "data": { "...": "..." } }
```

- `type` — the variable-type discriminator (`typeKey: type`), stored as the
  registry key verbatim (colon included).
- `theme` — a select limited to the 6 valid section themes.
- `data` — an object whose fields come from the manifest for that type.

All `data` fields are optional in the CMS (components guard with `data?.x`);
required-data validation still happens at build via `src/lib/sectionSchemas.ts`
and, in dev, the `ErrorShim`.

## Images

Image fields are authored as **path strings** (`{ src, alt }`) pointing under
`src/assets`, matching `ImageRef` and the build-time resolver in
`src/lib/images.ts`. (They are *not* the Decap upload widget, so authored paths
round-trip losslessly with hand-written JSON. Media uploads still land in
`src/assets/images/uploads` per `config.yml`.)

## One thing to verify in the live admin

The section type names contain colons (`hero:full`). Decap's docs impose no
restriction on variable-type `name`, and the generated YAML parses, but the first
time you open `/admin` confirm the Sections "Add" menu lists the types and saves a
page. If a future Decap version ever rejects colons, the **only** change needed is
`cmsTypeName()` in `scripts/generate-cms.mjs` (slugify) plus an inverse remap in
the pages content loader — the manifest and everything else stay as-is.
