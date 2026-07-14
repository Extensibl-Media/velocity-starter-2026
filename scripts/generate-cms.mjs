/**
 * generate-cms.mjs — regenerate the Decap `sections` field from the section
 * field manifest, keeping /admin in sync with every section component.
 *
 *   node scripts/generate-cms.mjs          # write
 *   node scripts/generate-cms.mjs --check   # fail if config.yml is stale (CI)
 *
 * Flow:
 *   1. Load the field manifest (src/lib/cms/sectionFields.mjs).
 *   2. Assert key-parity with the section registry (src/lib/sectionRegistry.ts)
 *      — every registered section type must have fields, and vice-versa.
 *   3. Emit a Decap variable-type `list` widget (one type per section).
 *   4. Splice it into public/admin/config.yml between the GENERATED markers.
 *
 * The CMS type name === the registry key (with colon). If a future Decap version
 * ever rejects colons in a type `name`, change `cmsTypeName()` below to slugify
 * and add the inverse remap in the pages content loader — that's the only seam.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { sectionFields } from "../src/lib/cms/sectionFields.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const registryPath = resolve(root, "src/lib/sectionRegistry.ts");
const configPath = resolve(root, "public/admin/config.yml");

const BEGIN = "# BEGIN GENERATED SECTIONS";
const END = "# END GENERATED SECTIONS";

/** The value stored under the `type` key for a section. Identity today. */
const cmsTypeName = (key) => key;

// ── 1 + 2. parity check against the registry ─────────────────────────────────
function registryKeys() {
  const src = readFileSync(registryPath, "utf8");
  const keys = new Set();
  for (const m of src.matchAll(/"([a-z0-9-]+:[a-z0-9-]+)"\s*:/g)) keys.add(m[1]);
  return keys;
}

function assertParity() {
  const reg = registryKeys();
  const manifest = new Set(Object.keys(sectionFields));
  const missingFields = [...reg].filter((k) => !manifest.has(k)).sort();
  const orphanFields = [...manifest].filter((k) => !reg.has(k)).sort();
  const errs = [];
  if (missingFields.length)
    errs.push(
      `Registered but no CMS fields (add to sectionFields.mjs):\n  - ${missingFields.join("\n  - ")}`,
    );
  if (orphanFields.length)
    errs.push(
      `CMS fields but not registered (remove or add to registry):\n  - ${orphanFields.join("\n  - ")}`,
    );
  if (errs.length) {
    console.error("✗ Section manifest is out of sync with the registry:\n");
    console.error(errs.join("\n\n"));
    process.exit(1);
  }
  return reg;
}

// ── 3. YAML emitter ──────────────────────────────────────────────────────────
const pad = (n) => " ".repeat(n);
const q = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const scalar = (v) =>
  typeof v === "boolean" || typeof v === "number" ? String(v) : q(v);

/**
 * Emit one FieldDef as YAML lines. `col` is the column of the leading `- `.
 * @returns {string[]}
 */
function emitField(f, col) {
  const lines = [];
  const k = pad(col + 2); // property indent (aligns after "- ")
  lines.push(`${pad(col)}- label: ${scalar(f.label ?? f.name)}`);
  lines.push(`${k}name: ${scalar(f.name)}`);

  const widget =
    f.widget === "stringlist" ? "list" : f.widget; // stringlist = default string list
  lines.push(`${k}widget: ${scalar(widget)}`);

  if (f.widget === "number") lines.push(`${k}value_type: "float"`);
  lines.push(`${k}required: ${f.required === true}`);
  if (f.hint) lines.push(`${k}hint: ${scalar(f.hint)}`);
  if (f.default !== undefined) lines.push(`${k}default: ${scalar(f.default)}`);
  if (Array.isArray(f.options))
    lines.push(`${k}options: [${f.options.map(scalar).join(", ")}]`);
  if (f.multiple) lines.push(`${k}multiple: true`);

  if ((f.widget === "object" || f.widget === "list") && Array.isArray(f.fields)) {
    if (f.widget === "list") lines.push(`${k}collapsed: true`);
    lines.push(`${k}fields:`);
    for (const child of f.fields) lines.push(...emitField(child, col + 4));
  }
  return lines;
}

const themeField = {
  name: "theme",
  label: "Theme",
  widget: "select",
  options: ["default", "alt", "muted", "inverse", "primary", "brand-secondary"],
  default: "default",
  required: false,
};

/** Build the whole `sections` field block at the given base column (dash col). */
function emitSectionsField(baseCol, keys) {
  const k = pad(baseCol + 2);
  const lines = [
    `${pad(baseCol)}- label: Sections`,
    `${k}name: sections`,
    `${k}label_singular: Section`,
    `${k}widget: list`,
    `${k}typeKey: type`,
    `${k}collapsed: true`,
    `${k}summary: "{{fields.type}}"`,
    `${k}types:`,
  ];
  const typeCol = baseCol + 4;
  const tk = pad(typeCol + 2);
  // registry order → stable, grouped output
  const orderedKeys = [...keys].filter((key) => sectionFields[key]);
  for (const key of orderedKeys) {
    const spec = sectionFields[key];
    lines.push(`${pad(typeCol)}- label: ${scalar(spec.label)}`);
    lines.push(`${tk}name: ${scalar(cmsTypeName(key))}`);
    lines.push(`${tk}widget: object`);
    lines.push(`${tk}fields:`);
    // theme sits beside data
    lines.push(...emitField(themeField, typeCol + 4));
    // data object wraps this type's fields
    lines.push(...emitField(
      { name: "data", label: "Content", widget: "object", required: false, fields: spec.fields },
      typeCol + 4,
    ));
  }
  return lines.join("\n");
}

// ── 4. splice into config.yml ────────────────────────────────────────────────
function baseColumnOf(line) {
  return line.length - line.trimStart().length;
}

function run() {
  const check = process.argv.includes("--check");
  const keys = assertParity();

  const config = readFileSync(configPath, "utf8");
  const lines = config.split("\n");
  const beginIdx = lines.findIndex((l) => l.includes(BEGIN));
  const endIdx = lines.findIndex((l) => l.includes(END));
  if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
    console.error(
      `✗ Could not find the GENERATED markers in ${configPath}.\n  Expected a "${BEGIN}" line and a "${END}" line inside the pages collection fields.`,
    );
    process.exit(1);
  }

  const baseCol = baseColumnOf(lines[beginIdx]); // marker is a field-list sibling
  const block = emitSectionsField(baseCol, keys);
  const next = [
    ...lines.slice(0, beginIdx + 1),
    block,
    ...lines.slice(endIdx),
  ].join("\n");

  const typeCount = Object.keys(sectionFields).length;

  if (check) {
    if (next !== config) {
      console.error(
        "✗ public/admin/config.yml is out of date. Run `npm run generate:cms`.",
      );
      process.exit(1);
    }
    console.log(`✓ config.yml is in sync (${typeCount} section types).`);
    return;
  }

  if (next === config) {
    console.log(`✓ config.yml already up to date (${typeCount} section types).`);
    return;
  }
  writeFileSync(configPath, next);
  console.log(
    `✓ Wrote ${typeCount} section types into public/admin/config.yml.`,
  );
}

run();
