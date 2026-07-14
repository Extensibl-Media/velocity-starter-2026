import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

/**
 * Central image resolver for JSON-driven content.
 *
 * Pages are composed from JSON, so image paths arrive as runtime STRINGS —
 * but Astro's <Image> optimizer needs a statically-imported ImageMetadata.
 * We bridge that here: every asset under src/assets is eagerly imported into
 * a path -> metadata map, so a JSON string like "/src/assets/images/x.jpg"
 * resolves to the real import and gets optimized. Public and remote URLs pass
 * through untouched.
 *
 * Accepted src forms:
 *   "/src/assets/images/x.jpg"  -> optimized (local asset)
 *   "@/assets/images/x.jpg"     -> optimized (alias, normalized to /src/…)
 *   "src/assets/images/x.jpg"   -> optimized (leading slash added)
 *   "x.jpg"                     -> optimized (assumed under assets/images)
 *   "/images/x.jpg"             -> passthrough (public/ asset)
 *   "https://…" / "data:…"       -> passthrough (remote)
 */

const assets = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/**/*.{jpeg,jpg,png,gif,webp,avif,svg}",
  { eager: true },
);

function normalize(src: string): string {
  if (src.startsWith("@/")) return src.replace(/^@\//, "/src/");
  if (src.startsWith("src/")) return "/" + src;
  return src;
}

export type ResolvedImage = ImageMetadata | string | undefined;

/**
 * Resolve a JSON src to ImageMetadata (local, optimizable) or a passthrough
 * URL string (public/remote). Returns undefined when a local asset path is
 * referenced but the file is missing — callers can then fall back.
 */
export function resolveImage(src?: string): ResolvedImage {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src) || src.startsWith("data:")) return src;
  const key = normalize(src);
  if (key.startsWith("/src/")) return assets[key]?.default;
  if (key.startsWith("/")) return src; // public/ asset — passthrough as authored
  return assets[`/src/assets/images/${key}`]?.default;
}

/** Type guard: a resolved image that can go through <Image>. */
export function isLocal(img: ResolvedImage): img is ImageMetadata {
  return !!img && typeof img !== "string";
}

/**
 * Produce an optimized URL for CSS `background-image`. Local assets are run
 * through getImage(); public/remote URLs are returned as-is. Returns undefined
 * when nothing resolves so callers can skip the background entirely.
 */
export async function getBackgroundImage(
  src: string | undefined,
  opts: { width?: number; format?: "webp" | "avif" | "jpeg" } = {},
): Promise<string | undefined> {
  const resolved = resolveImage(src);
  if (!resolved) return undefined;
  if (typeof resolved === "string") return resolved;
  const img = await getImage({
    src: resolved,
    width: opts.width ?? 1920,
    format: opts.format ?? "webp",
  });
  return img.src;
}
