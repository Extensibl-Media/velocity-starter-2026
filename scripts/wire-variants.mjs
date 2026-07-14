/**
 * wire-variants.mjs — splice agent-produced section variants into the shared
 * files (registry + CMS field manifest + demo page). Reads manifest JSONs from
 * a pending dir and, for each section:
 *   - verifies the component file exists and the typeKey isn't already registered
 *   - remaps demo image paths that don't exist to real ones (alternating)
 *   - unescapes stray HTML entities in demo data
 *   - forces the demo eyebrow to the typeKey badge (keeps /components navigable)
 *   - inserts registry import+key, sectionFields entry, and a demo section
 *
 * Usage: node scripts/wire-variants.mjs <pendingDir>
 * Idempotent-ish: skips any typeKey already present in the registry.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pendingDir = process.argv[2];
if (!pendingDir) {
  console.error("usage: node scripts/wire-variants.mjs <pendingDir>");
  process.exit(1);
}

const registryPath = resolve(root, "src/lib/sectionRegistry.ts");
const fieldsPath = resolve(root, "src/lib/cms/sectionFields.mjs");
const demoPath = resolve(root, "src/content/pages/components.json");
const imgDir = resolve(root, "src/assets/images");

const sectionsRoot = resolve(root, "src/components/sections");
const sectionDirs = readdirSync(sectionsRoot);
// The component dir isn't always the group name (e.g. group "feature" -> dir
// "features"), so locate each file by searching the section dirs.
const findComp = (file) => {
  for (const d of sectionDirs) {
    const p = resolve(sectionsRoot, d, file);
    if (existsSync(p)) return { dir: d, path: p };
  }
  return null;
};

const allowedImgs = new Set(readdirSync(imgDir));
const imgPool = ["/src/assets/images/landing.jpg", "/src/assets/images/roofing-crew.jpg"];
let imgCounter = 0;

const fixStr = (s) => {
  s = s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  if (s.startsWith("/src/assets/images/")) {
    const base = s.split("/").pop();
    if (!allowedImgs.has(base)) s = imgPool[imgCounter++ % imgPool.length];
  }
  return s;
};
const walk = (v) => {
  if (typeof v === "string") return fixStr(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v)) o[k] = walk(v[k]);
    return o;
  }
  return v;
};

// ── load registry keys for dup detection ─────────────────────────────────────
let registry = readFileSync(registryPath, "utf8");
const existingKeys = new Set(
  [...registry.matchAll(/"([a-z0-9-]+:[a-z0-9-]+)"\s*:/g)].map((m) => m[1]),
);

// ── gather sections from all manifests ───────────────────────────────────────
const manifests = readdirSync(pendingDir).filter((f) => f.endsWith(".json"));
const imports = [];
const keys = [];
const fields = [];
const demosByGroup = {};
let added = 0;
const skipped = [];

for (const file of manifests) {
  const m = JSON.parse(readFileSync(resolve(pendingDir, file), "utf8"));
  for (const s of m.sections) {
    const group = s.typeKey.split(":")[0];
    const base = s.file.replace(/\.astro$/, "");
    if (existingKeys.has(s.typeKey)) { skipped.push(`${s.typeKey} (already registered)`); continue; }
    const loc = findComp(s.file);
    if (!loc) { skipped.push(`${s.typeKey} (missing file ${s.file})`); continue; }
    existingKeys.add(s.typeKey);
    added++;

    imports.push(`import ${s.importName} from "@/components/sections/${loc.dir}/${base}.astro";`);
    keys.push(`  ${JSON.stringify(s.typeKey)}: ${s.importName},`);
    fields.push(`  ${JSON.stringify(s.typeKey)}: def(${JSON.stringify(s.label)}, ${s.cmsFields}),`);

    const data = walk(s.demoData);
    data.eyebrow = { text: s.typeKey, variant: "badge" };
    (demosByGroup[group] ??= []).push({ type: s.typeKey, theme: s.demoTheme ?? "default", data });
  }
}

if (!added) {
  console.log("Nothing to wire.", skipped.length ? "Skipped:\n  " + skipped.join("\n  ") : "");
  process.exit(0);
}

// ── splice helper ────────────────────────────────────────────────────────────
const insertBefore = (content, marker, lines) => {
  const arr = content.split("\n");
  const idx = arr.findIndex((l) => l.includes(marker));
  if (idx === -1) throw new Error(`marker not found: ${marker}`);
  arr.splice(idx, 0, ...lines);
  return arr.join("\n");
};

registry = insertBefore(registry, "// GEN:variant-imports", imports);
registry = insertBefore(registry, "// GEN:variant-keys", keys);
writeFileSync(registryPath, registry);

let fieldsSrc = readFileSync(fieldsPath, "utf8");
fieldsSrc = insertBefore(fieldsSrc, "// GEN:variant-fields", fields);
writeFileSync(fieldsPath, fieldsSrc);

// ── demo page: insert each group's demos after that group's last section ─────
const demo = JSON.parse(readFileSync(demoPath, "utf8"));
for (const [group, sections] of Object.entries(demosByGroup)) {
  let lastIdx = -1;
  demo.sections.forEach((sec, i) => {
    if (typeof sec.type === "string" && sec.type.startsWith(`${group}:`)) lastIdx = i;
  });
  if (lastIdx === -1) demo.sections.push(...sections);
  else demo.sections.splice(lastIdx + 1, 0, ...sections);
}
writeFileSync(demoPath, JSON.stringify(demo, null, 2) + "\n");

console.log(`✓ Wired ${added} sections across ${Object.keys(demosByGroup).length} groups.`);
if (skipped.length) console.log(`  Skipped ${skipped.length}:\n    ${skipped.join("\n    ")}`);
console.log("  Next: npm run generate:cms && npm run build");
