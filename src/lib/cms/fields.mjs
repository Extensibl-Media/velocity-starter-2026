/**
 * CMS field vocabulary + reusable fragments.
 *
 * This is the low-level toolkit the section-field manifest (sectionFields.mjs)
 * is composed from. Each helper returns a plain FieldDef object (or array of
 * them) that the generator (scripts/generate-cms.mjs) maps to Decap widgets.
 *
 * The fragments here mirror the shared interfaces in src/types/sections.ts
 * (Eyebrow, SectionCTA, ImageRef, ProcessStep, StatItem, PricingPlan, …) so the
 * CMS stays in lockstep with what the section components actually read. When a
 * shared interface changes, update the matching fragment here and regenerate.
 *
 * FieldDef shape (the subset of Decap we use):
 *   { name, label?, widget, required?, hint?, default?, ...widgetOpts }
 *   widget ∈ string | text | markdown | number | boolean | select | image
 *           | object | list | stringlist
 *   - object/list carry `fields: FieldDef[]`
 *   - select carries `options: string[]` (+ optional `multiple: true`)
 *   - stringlist = a plain array-of-strings list
 *
 * @typedef {Object} FieldDef
 * @property {string} name
 * @property {string} [label]
 * @property {string} widget
 * @property {boolean} [required]
 * @property {string} [hint]
 * @property {*} [default]
 * @property {string[]} [options]
 * @property {boolean} [multiple]
 * @property {FieldDef[]} [fields]
 */

const THEMES = [
  "default",
  "alt",
  "muted",
  "inverse",
  "primary",
  "brand-secondary",
];

// ── primitives ───────────────────────────────────────────────────────────────
/** @returns {FieldDef} */
export const str = (name, label, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "string",
  required: false,
  ...opts,
});

/** multiline plain text @returns {FieldDef} */
export const text = (name, label, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "text",
  required: false,
  ...opts,
});

/** rich text @returns {FieldDef} */
export const markdown = (name, label, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "markdown",
  required: false,
  ...opts,
});

/** @returns {FieldDef} */
export const num = (name, label, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "number",
  required: false,
  ...opts,
});

/** @returns {FieldDef} */
export const bool = (name, label, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "boolean",
  required: false,
  default: false,
  ...opts,
});

/** @returns {FieldDef} */
export const select = (name, label, options, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "select",
  options,
  required: false,
  ...opts,
});

/**
 * Image reference authored as a path string ({ src, alt }) — matches ImageRef
 * in src/types/sections.ts, resolved by src/lib/images.ts. Kept as an object of
 * strings (not the Decap `image` upload widget) so authored paths stay
 * `/src/assets/...` and round-trip losslessly with hand-written JSON.
 * @returns {FieldDef}
 */
export const image = (name = "image", label) => ({
  name,
  label: label ?? titleCase(name),
  widget: "object",
  required: false,
  fields: [
    str("src", "Image path", {
      hint: "Path under src/assets, e.g. /src/assets/images/roof.jpg",
    }),
    str("alt", "Alt text"),
  ],
});

/** array of plain strings (bullets, features) @returns {FieldDef} */
export const stringlist = (name, label, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "stringlist",
  required: false,
  ...opts,
});

/** an object of sub-fields @returns {FieldDef} */
export const object = (name, label, fields, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "object",
  required: false,
  fields,
  ...opts,
});

/** a repeatable list of objects @returns {FieldDef} */
export const list = (name, label, fields, opts = {}) => ({
  name,
  label: label ?? titleCase(name),
  widget: "list",
  required: false,
  fields,
  ...opts,
});

// ── shared fragments (mirror src/types/sections.ts) ──────────────────────────
/** Eyebrow { text, variant } */
export const eyebrow = () =>
  object("eyebrow", "Eyebrow", [
    str("text", "Text"),
    select("variant", "Style", ["badge", "tag", "text"], { default: "text" }),
  ]);

/** SectionCTA { label, href, variant } */
export const cta = (name = "cta", label = "Button") =>
  object(name, label, [
    str("label", "Label"),
    str("href", "Link"),
    select("variant", "Style", ["primary", "secondary", "outline", "ghost"], {
      default: "primary",
    }),
  ]);

/** The header most sections accept: eyebrow + heading + subheading. */
export const sectionHeader = () => [
  eyebrow(),
  str("heading", "Heading"),
  text("subheading", "Subheading"),
];

/** Hero header variant (headline/subheadline naming some heroes use). */
export const heroHeader = () => [
  eyebrow(),
  str("headline", "Headline"),
  text("subheadline", "Subheadline"),
];

// item-array fragments -------------------------------------------------------
/** FeatureItem { icon, title, body, bullets } */
export const featureItems = (name = "items", label = "Items") =>
  list(name, label, [
    str("icon", "Icon"),
    str("title", "Title"),
    text("body", "Body"),
    stringlist("bullets", "Bullets"),
  ]);

/** ProcessStep { heading, body } */
export const processSteps = (name = "steps", label = "Steps") =>
  list(name, label, [str("heading", "Heading"), text("body", "Body")]);

/** StatItem { value, label, description } */
export const stats = (name = "stats", label = "Stats") =>
  list(name, label, [
    str("value", "Value"),
    str("label", "Label"),
    text("description", "Description"),
  ]);

/** PricingPlan { name, price, period, description, features, cta, highlighted } */
export const pricingPlans = (name = "plans", label = "Plans") =>
  list(name, label, [
    str("name", "Name"),
    str("price", "Price"),
    str("period", "Period"),
    text("description", "Description"),
    stringlist("features", "Features"),
    cta("cta", "Button"),
    bool("highlighted", "Highlighted"),
  ]);

/** TeamMember { name, role, photo, bio } */
export const teamMembers = (name = "members", label = "Members") =>
  list(name, label, [
    str("name", "Name"),
    str("role", "Role"),
    str("photo", "Photo path", {
      hint: "Path under src/assets",
    }),
    text("bio", "Bio"),
  ]);

/** FeatureRow { heading, body, image, bullets } */
export const featureRows = (name = "rows", label = "Rows") =>
  list(name, label, [
    str("heading", "Heading"),
    text("body", "Body"),
    image("image", "Image"),
    stringlist("bullets", "Bullets"),
  ]);

/** ComparisonRow { feature, us, them } (bool|string authored as string) */
export const comparisonRows = (name = "rows", label = "Rows") =>
  list(name, label, [
    str("feature", "Feature"),
    str("us", "Us", { hint: "true / false / or a short phrase" }),
    str("them", "Them", { hint: "true / false / or a short phrase" }),
  ]);

/** TimelineItem { title, year, body } */
export const timelineItems = (name = "items", label = "Milestones") =>
  list(name, label, [
    str("title", "Title"),
    str("year", "Year"),
    text("body", "Body"),
  ]);

/** TabItem { label, heading, body, bullets, icon } */
export const tabs = (name = "tabs", label = "Tabs") =>
  list(name, label, [
    str("label", "Tab label"),
    str("heading", "Heading"),
    text("body", "Body"),
    stringlist("bullets", "Bullets"),
    str("icon", "Icon"),
  ]);

/** CertItem { label, logo, description } */
export const certItems = (name = "items", label = "Certifications") =>
  list(name, label, [
    str("label", "Label"),
    str("logo", "Logo path", { hint: "Path under src/assets" }),
    text("description", "Description"),
  ]);

/** LogoItem { src, alt, href } */
export const logos = (name = "logos", label = "Logos") =>
  list(name, label, [
    str("src", "Logo path", { hint: "Path under src/assets" }),
    str("alt", "Alt text"),
    str("href", "Link"),
  ]);

/** RatingSource { name, rating, count, url } */
export const ratingSources = (name = "sources", label = "Rating sources") =>
  list(name, label, [
    str("name", "Source", { hint: "Google / Facebook / Yelp / …" }),
    num("rating", "Rating"),
    num("count", "Review count"),
    str("url", "Link"),
  ]);

/** EstimateRow { service, from, note } */
export const estimateRows = (name = "rows", label = "Rows") =>
  list(name, label, [
    str("service", "Service"),
    str("from", "Starting price"),
    text("note", "Note"),
  ]);

/** Gallery images (array of ImageRef) */
export const galleryImages = (name = "images", label = "Images") =>
  list(name, label, [
    str("src", "Image path", { hint: "Path under src/assets" }),
    str("alt", "Alt text"),
    str("caption", "Caption"),
    str("category", "Category", { hint: "for filterable galleries" }),
  ]);

/** Before/after pairs */
export const beforeAfterPairs = (name = "pairs", label = "Before / after") =>
  list(name, label, [
    str("before", "Before path", { hint: "Path under src/assets" }),
    str("after", "After path", { hint: "Path under src/assets" }),
    str("label", "Label"),
  ]);

// form fragment --------------------------------------------------------------
/** FormConfig — the lead-form slot config (simple | quiz). */
export const form = () =>
  object("form", "Lead form", [
    select("type", "Form type", ["simple", "quiz"], { default: "simple" }),
    str("title", "Title"),
    text("description", "Description"),
    str("submitLabel", "Submit button label"),
    object("submit", "Submit destination", [
      str("endpoint", "Endpoint URL", {
        hint: "GHL webhook or any URL; leave blank for event-only",
      }),
      str("method", "HTTP method", { default: "POST" }),
      str("redirect", "Redirect after submit"),
    ]),
    list("steps", "Quiz steps (quiz only)", [
      str("id", "Step id"),
      select("type", "Step type", [
        "single-select",
        "multi-select",
        "scale",
        "contact",
      ]),
      str("question", "Question"),
      text("help", "Help text"),
      bool("autoAdvance", "Auto-advance"),
      list("options", "Options", [
        str("label", "Label"),
        str("value", "Value"),
        text("description", "Description"),
        str("icon", "Icon"),
      ]),
      list("fields", "Contact fields", [
        str("name", "Name"),
        str("label", "Label"),
        select("type", "Input type", ["text", "tel", "email"]),
        str("placeholder", "Placeholder"),
        bool("required", "Required"),
      ]),
    ]),
    object("outcome", "Outcome screen (quiz only)", [
      str("heading", "Heading", { hint: "supports {{stepId}} tokens" }),
      text("body", "Body", { hint: "supports {{stepId}} tokens" }),
    ]),
  ]);

// collection-backed selectors ------------------------------------------------
/**
 * Fields for sections that render items from a content collection (services,
 * reviews, service-areas, faqs). Their `data` is presentational config only.
 */
export const listControls = (extra = []) => [
  num("limit", "Max items"),
  ...extra,
];

// ── misc ─────────────────────────────────────────────────────────────────────
export function titleCase(s) {
  return String(s)
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const themeField = () =>
  select("theme", "Theme", THEMES, { default: "default" });

export { THEMES };
