import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getEmDashCollection } from "emdash";
import pagesSeo from "../../.emdash/pages-seo.json";

export const prerender = false;

// Dev-only seed companion: copies seeded pages' meta into EmDash's NATIVE SEO
// store (_emdash_seo). Seed files can't carry native SEO (SeedContentEntry has no
// `seo` field), so this MUST be re-run once after every reseed to re-apply page
// SEO. Reads .emdash/pages-seo.json (produced by build-seed.mjs). content_id = the
// content row .id (= entry.data.id; the loader joins seo on content.id).
// See docs/setup-new-site.md. 403s outside dev.
export const GET: APIRoute = async () => {
  if (!import.meta.env.DEV) return new Response("dev only", { status: 403 });
  const DB = (env as any).DB;
  if (!DB) return new Response("D1 binding (DB) not available", { status: 500 });

  const { entries } = await getEmDashCollection("pages" as any);
  const map = pagesSeo as Record<string, any>;
  const now = new Date().toISOString();
  const migrated: string[] = [];

  const sql =
    `INSERT INTO _emdash_seo (collection, content_id, seo_title, seo_description, seo_image, seo_canonical, seo_no_index, created_at, updated_at)` +
    ` VALUES ('pages', ?, ?, ?, ?, ?, ?, ?, ?)` +
    ` ON CONFLICT(collection, content_id) DO UPDATE SET seo_title=excluded.seo_title, seo_description=excluded.seo_description,` +
    ` seo_image=excluded.seo_image, seo_canonical=excluded.seo_canonical, seo_no_index=excluded.seo_no_index, updated_at=excluded.updated_at`;

  for (const e of entries as any[]) {
    const slug = e.data?.slug ?? e.id;
    const cid = e.data?.id;
    const seo = map[slug];
    if (!seo || !cid) continue;
    if (!seo.title && !seo.description && !seo.image && !seo.canonical && !seo.noIndex) continue;
    await DB.prepare(sql)
      .bind(cid, seo.title ?? null, seo.description ?? null, seo.image ?? null, seo.canonical ?? null, seo.noIndex ? 1 : 0, now, now)
      .run();
    migrated.push(slug);
  }

  return new Response(JSON.stringify({ migrated: migrated.length, pages: migrated }, null, 2), {
    headers: { "content-type": "application/json" },
  });
};
