/**
 * SECTION FIELD MANIFEST — the single source of truth for what each section
 * type exposes to the CMS. `scripts/generate-cms.mjs` turns this into the Decap
 * variable-type `sections` list so every one of the 126 section types is
 * editable in /admin, kept in sync (not a subset).
 *
 * Each entry: `type -> { label, fields }` where `fields` are the `data.*` fields
 * (the generator adds `type` + `theme` around them). Compose from the fragments
 * in fields.mjs; only hand-write a bespoke field list when a type is unique.
 *
 * Keep in lockstep with:
 *   - src/lib/sectionRegistry.ts  (every key here must exist there, and vice-versa)
 *   - src/types/sections.ts       (fragment field shapes)
 *   - src/lib/sectionSchemas.ts   (required-data validation)
 * The generator asserts key-parity against the registry and fails loudly on drift.
 */

import {
  str,
  text,
  markdown,
  num,
  bool,
  select,
  image,
  stringlist,
  object,
  list,
  eyebrow,
  cta,
  sectionHeader,
  heroHeader,
  form,
  featureItems,
  featureRows,
  processSteps,
  stats,
  pricingPlans,
  teamMembers,
  comparisonRows,
  timelineItems,
  tabs,
  certItems,
  logos,
  ratingSources,
  estimateRows,
  galleryImages,
  beforeAfterPairs,
} from "./fields.mjs";

/** @param {string} label @param {import('./fields.mjs').FieldDef[]} fields */
const def = (label, fields) => ({ label, fields });

// bespoke local fragments (used once or twice) --------------------------------
const secondaryCta = () => cta("secondaryCta", "Secondary button");
const mapEmbed = () =>
  str("mapEmbedUrl", "Map embed URL", {
    hint: "Google Maps embed src URL",
  });
const contactCards = () =>
  list("cards", "Contact cards", [
    str("icon", "Icon"),
    str("title", "Title"),
    text("body", "Body"),
    str("href", "Link"),
  ]);
const inlineItems = () =>
  list("items", "Items", [str("icon", "Icon"), str("text", "Text")]);
const reviewVideos = () =>
  list("videos", "Videos", [
    str("video", "YouTube ID or URL"),
    str("author", "Author"),
    str("caption", "Caption"),
  ]);
/** collection-backed presentational config */
const listControls = (extra = []) => [num("limit", "Max items"), ...extra];
const filterControls = () => [
  num("limit", "Max items"),
  select("filter", "Show", ["all", "featured"], { default: "all" }),
  str("service", "Filter by service slug"),
];

/** @type {Record<string, {label: string, fields: import('./fields.mjs').FieldDef[]}>} */
export const sectionFields = {
  // ── HEROES ────────────────────────────────────────────────────────────────
  "hero:full": def("Hero — Full", [...heroHeader(), cta(), secondaryCta(), image()]),
  "hero:gradient": def("Hero — Gradient", [...heroHeader(), cta(), secondaryCta()]),
  "hero:image-overlay": def("Hero — Image Overlay", [...heroHeader(), cta(), secondaryCta(), image()]),
  "hero:minimal": def("Hero — Minimal", [...heroHeader(), cta(), secondaryCta()]),
  "hero:split-form": def("Hero — Split + Form", [...heroHeader(), cta(), form()]),
  "hero:split-image": def("Hero — Split Image", [...heroHeader(), cta(), secondaryCta(), image()]),
  "hero:stacked-form": def("Hero — Stacked + Form", [...heroHeader(), form()]),
  "hero:stats": def("Hero — Stats", [...heroHeader(), cta(), secondaryCta(), stats()]),
  "hero:video": def("Hero — Video", [...heroHeader(), cta(), str("video", "YouTube ID or URL")]),
  "hero:centered-card": def("Hero — Centered Card", [...heroHeader(), cta(), secondaryCta()]),
  "hero:split-content": def("Hero — Split Content", [...sectionHeader(), text("body", "Body"), cta(), secondaryCta(), bool("showPhone", "Show phone link")]),
  "hero:split-stats": def("Hero — Split Stats", [...sectionHeader(), cta(), secondaryCta(), bool("showPhone", "Show phone link"), stats()]),
  "hero:overlay-card": def("Hero — Overlay Card", [...sectionHeader(), text("body", "Body"), cta(), secondaryCta(), bool("showPhone", "Show phone link"), image(), select("cardPosition", "Card position", ["left", "right"], { default: "left" })]),
  "hero:angled": def("Hero — Angled", [...sectionHeader(), text("body", "Body"), cta(), secondaryCta(), bool("showPhone", "Show phone link"), image()]),
  "hero:badge-row": def("Hero — Badge Row", [...sectionHeader(), cta(), secondaryCta(), list("badges", "Trust badges", [str("icon", "Icon (emoji, optional)"), str("label", "Label")])]),
  "hero:split-checklist": def("Hero — Split Checklist", [...sectionHeader(), cta(), secondaryCta(), bool("showPhone", "Show phone link"), str("checklistTitle", "Checklist title"), stringlist("bullets", "Checklist items")]),

  // ── ABOUT ─────────────────────────────────────────────────────────────────
  "about:full-bleed": def("About — Full Bleed", [...sectionHeader(), markdown("body", "Body"), image(), cta()]),
  "about:mission": def("About — Mission", [...sectionHeader(), text("quote", "Quote"), markdown("body", "Body"), image()]),
  "about:owner-video": def("About — Owner Video", [...sectionHeader(), str("video", "YouTube ID or URL"), markdown("body", "Body"), str("ownerName", "Owner name"), str("ownerRole", "Owner role")]),
  "about:split": def("About — Split", [...sectionHeader(), markdown("body", "Body"), image(), cta(), stringlist("bullets", "Bullets")]),
  "about:stacked": def("About — Stacked", [...sectionHeader(), markdown("body", "Body"), image()]),
  "about:stats-band": def("About — Stats Band", [...sectionHeader(), stats()]),
  "about:team-story": def("About — Team Story", [...sectionHeader(), markdown("body", "Body"), image(), teamMembers()]),
  "about:timeline": def("About — Timeline", [...sectionHeader(), timelineItems()]),
  "about:values": def("About — Values", [...sectionHeader(), featureItems()]),
  "about:why-choose-us": def("About — Why Choose Us", [...sectionHeader(), markdown("body", "Body"), image(), str("overlayText", "Overlay text"), stats()]),

  // ── BANNER ──────────────────────────────────────────────────────────────────
  "banner:announcement": def("Banner — Announcement", [str("text", "Text"), cta(), str("icon", "Icon"), bool("dismissible", "Dismissible")]),

  // ── BENEFITS ────────────────────────────────────────────────────────────────
  "benefits:grid": def("Benefits — Grid", [...sectionHeader(), featureItems()]),
  "benefits:icon-list": def("Benefits — Icon List", [...sectionHeader(), featureItems()]),
  "benefits:tabs": def("Benefits — Tabs", [...sectionHeader(), tabs()]),

  // ── CERTIFICATIONS ───────────────────────────────────────────────────────────
  "certifications:grid": def("Certifications — Grid", [...sectionHeader(), certItems()]),
  "certifications:logos-row": def("Certifications — Logos Row", [...sectionHeader(), logos()]),

  // ── COMPARISON ───────────────────────────────────────────────────────────────
  "comparison:us-vs-them": def("Comparison — Us vs Them", [...sectionHeader(), str("usLabel", "Our label"), str("themLabel", "Their label"), comparisonRows(), cta()]),

  // ── CONTACT ──────────────────────────────────────────────────────────────────
  "contact:cards": def("Contact — Cards", [...sectionHeader(), contactCards()]),
  "contact:cta": def("Contact — CTA", [...sectionHeader(), markdown("body", "Body"), str("phone", "Phone"), cta()]),
  "contact:form": def("Contact — Form", [...sectionHeader(), form()]),
  "contact:hours": def("Contact — Hours", [...sectionHeader(), text("note", "Note")]),
  "contact:inline-form": def("Contact — Inline Form", [...sectionHeader(), form()]),
  "contact:map-form": def("Contact — Map + Form", [...sectionHeader(), form(), mapEmbed()]),
  "contact:split": def("Contact — Split", [...sectionHeader(), markdown("body", "Body"), form(), mapEmbed()]),

  // ── CONTENT ──────────────────────────────────────────────────────────────────
  "content:callout": def("Content — Callout", [...sectionHeader(), markdown("body", "Body"), cta()]),
  "content:cards": def("Content — Cards", [...sectionHeader(), featureItems()]),
  "content:image-text": def("Content — Image + Text", [...sectionHeader(), markdown("body", "Body"), image(), select("imagePosition", "Image position", ["left", "right"], { default: "right" }), stringlist("bullets", "Bullets"), cta()]),
  "content:quote": def("Content — Quote", [text("quote", "Quote"), str("author", "Author"), str("role", "Role"), image("avatar", "Avatar")]),
  "content:rich-text": def("Content — Rich Text", [...sectionHeader(), markdown("body", "Body")]),
  "content:two-column": def("Content — Two Column", [...sectionHeader(), markdown("bodyLeft", "Left column"), markdown("bodyRight", "Right column")]),

  // ── CTA ──────────────────────────────────────────────────────────────────────
  "cta:banner": def("CTA — Banner", [str("heading", "Heading"), text("subheading", "Subheading"), cta()]),
  "cta:card": def("CTA — Card", [str("heading", "Heading"), text("subheading", "Subheading"), cta(), secondaryCta()]),
  "cta:centered": def("CTA — Centered", [...sectionHeader(), cta(), secondaryCta()]),
  "cta:gradient": def("CTA — Gradient", [str("heading", "Heading"), text("subheading", "Subheading"), cta(), secondaryCta()]),
  "cta:newsletter": def("CTA — Newsletter", [str("heading", "Heading"), text("subheading", "Subheading"), str("placeholder", "Input placeholder"), str("submitLabel", "Submit label"), str("endpoint", "Endpoint URL")]),
  "cta:phone-focused": def("CTA — Phone Focused", [str("heading", "Heading"), text("subheading", "Subheading"), str("phone", "Phone"), cta()]),
  "cta:split": def("CTA — Split", [str("heading", "Heading"), text("subheading", "Subheading"), cta(), secondaryCta()]),
  "cta:split-image": def("CTA — Split Image", [str("heading", "Heading"), text("subheading", "Subheading"), cta(), image()]),
  "cta:sticky-bar": def("CTA — Sticky Bar", [str("text", "Text"), str("phone", "Phone"), cta()]),

  // ── FAQS (collection-backed) ─────────────────────────────────────────────────
  "faqs:accordion": def("FAQs — Accordion", [...sectionHeader(), ...listControls([str("category", "Filter by category")])]),
  "faqs:categorized": def("FAQs — Categorized", [...sectionHeader(), ...listControls()]),
  "faqs:grid": def("FAQs — Grid", [...sectionHeader(), ...listControls([str("category", "Filter by category")])]),
  "faqs:stacked": def("FAQs — Stacked", [...sectionHeader(), ...listControls([str("category", "Filter by category")])]),
  "faqs:two-column": def("FAQs — Two Column", [...sectionHeader(), ...listControls([str("category", "Filter by category")])]),

  // ── FEATURE ──────────────────────────────────────────────────────────────────
  "feature:alternating": def("Feature — Alternating", [...sectionHeader(), featureRows()]),
  "feature:cards": def("Feature — Cards", [...sectionHeader(), featureItems()]),
  "feature:centered-icons": def("Feature — Centered Icons", [...sectionHeader(), featureItems()]),
  "feature:checklist": def("Feature — Checklist", [...sectionHeader(), featureItems()]),
  "feature:highlight": def("Feature — Highlight", [...sectionHeader(), markdown("body", "Body"), image(), stringlist("bullets", "Bullets"), cta()]),
  "feature:list": def("Feature — List", [...sectionHeader(), featureItems()]),

  // ── GALLERY ──────────────────────────────────────────────────────────────────
  "gallery:before-after": def("Gallery — Before/After", [...sectionHeader(), beforeAfterPairs()]),
  "gallery:before-after-grid": def("Gallery — Before/After Grid", [...sectionHeader(), beforeAfterPairs()]),
  "gallery:carousel": def("Gallery — Carousel", [...sectionHeader(), galleryImages()]),
  "gallery:featured": def("Gallery — Featured", [...sectionHeader(), galleryImages()]),
  "gallery:filterable": def("Gallery — Filterable", [...sectionHeader(), bool("showFilters", "Show filter bar", { default: true }), galleryImages()]),
  "gallery:grid": def("Gallery — Grid", [...sectionHeader(), galleryImages()]),
  "gallery:instagram": def("Gallery — Instagram", [...sectionHeader(), str("handle", "Instagram handle"), galleryImages()]),
  "gallery:masonry": def("Gallery — Masonry", [...sectionHeader(), galleryImages()]),

  // ── GUARANTEE ────────────────────────────────────────────────────────────────
  "guarantee:badges": def("Guarantee — Badges", [...sectionHeader(), certItems()]),
  "guarantee:callout": def("Guarantee — Callout", [...sectionHeader(), markdown("body", "Body"), image(), stringlist("bullets", "Bullets"), cta()]),

  // ── LOCATION ─────────────────────────────────────────────────────────────────
  "location:map-embed": def("Location — Map Embed", [...sectionHeader(), mapEmbed(), str("address", "Address")]),

  // ── PRICING ──────────────────────────────────────────────────────────────────
  "pricing:addons": def("Pricing — Add-ons", [...sectionHeader(), estimateRows()]),
  "pricing:cards": def("Pricing — Cards", [...sectionHeader(), pricingPlans("items", "Cards")]),
  "pricing:estimate": def("Pricing — Estimate", [...sectionHeader(), estimateRows()]),
  "pricing:packages": def("Pricing — Packages", [...sectionHeader(), pricingPlans()]),
  "pricing:single": def("Pricing — Single", [...sectionHeader(), str("name", "Name"), str("price", "Price"), str("period", "Period"), text("description", "Description"), stringlist("inclusions", "Inclusions"), cta(), bool("highlighted", "Highlighted")]),
  "pricing:table": def("Pricing — Table", [...sectionHeader(), pricingPlans()]),
  "pricing:tiers": def("Pricing — Tiers", [...sectionHeader(), pricingPlans()]),

  // ── PROCESS ──────────────────────────────────────────────────────────────────
  "process:cards": def("Process — Cards", [...sectionHeader(), processSteps()]),
  "process:horizontal": def("Process — Horizontal", [...sectionHeader(), processSteps()]),
  "process:icon-row": def("Process — Icon Row", [...sectionHeader(), list("steps", "Steps", [str("icon", "Icon"), str("heading", "Heading"), text("body", "Body")])]),
  "process:numbered": def("Process — Numbered", [...sectionHeader(), processSteps()]),
  "process:timeline": def("Process — Timeline", [...sectionHeader(), processSteps()]),
  "process:vertical": def("Process — Vertical", [...sectionHeader(), processSteps()]),

  // ── REVIEWS (mostly collection-backed) ───────────────────────────────────────
  "reviews:cards": def("Reviews — Cards", [...sectionHeader(), ...filterControls()]),
  "reviews:carousel": def("Reviews — Carousel", [...sectionHeader(), ...filterControls()]),
  "reviews:compact-grid": def("Reviews — Compact Grid", [...sectionHeader(), ...filterControls()]),
  "reviews:featured": def("Reviews — Featured", [...sectionHeader(), text("quote", "Quote"), str("author", "Author"), str("location", "Location"), num("rating", "Rating")]),
  "reviews:list": def("Reviews — List", [...sectionHeader(), ...filterControls()]),
  "reviews:masonry": def("Reviews — Masonry", [...sectionHeader(), ...filterControls()]),
  "reviews:quote": def("Reviews — Quote", [...sectionHeader(), text("quote", "Quote"), str("author", "Author"), str("role", "Role"), num("rating", "Rating")]),
  "reviews:split": def("Reviews — Split", [...sectionHeader(), ...filterControls()]),
  "reviews:summary": def("Reviews — Summary", [...sectionHeader(), ratingSources(), ...listControls()]),
  "reviews:video": def("Reviews — Video", [...sectionHeader(), str("video", "YouTube ID or URL"), str("author", "Author"), str("caption", "Caption")]),
  "reviews:video-duo": def("Reviews — Video Duo", [...sectionHeader(), reviewVideos()]),

  // ── SERVICE AREAS (collection-backed) ────────────────────────────────────────
  "service-areas:accordion": def("Service Areas — Accordion", [...sectionHeader(), ...listControls()]),
  "service-areas:cards-detailed": def("Service Areas — Cards Detailed", [...sectionHeader(), ...listControls()]),
  "service-areas:grid": def("Service Areas — Grid", [...sectionHeader(), ...listControls()]),
  "service-areas:list": def("Service Areas — List", [...sectionHeader(), ...listControls()]),
  "service-areas:map-full": def("Service Areas — Map Full", [...sectionHeader(), ...listControls(), mapEmbed()]),
  "service-areas:map-split": def("Service Areas — Map Split", [...sectionHeader(), ...listControls(), mapEmbed()]),
  "service-areas:tabs": def("Service Areas — Tabs", [...sectionHeader(), ...listControls()]),

  // ── SERVICES (collection-backed) ─────────────────────────────────────────────
  "services:accordion": def("Services — Accordion", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:cards": def("Services — Cards", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:carousel": def("Services — Carousel", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:featured-split": def("Services — Featured Split", [...sectionHeader(), ...listControls(), select("imagePosition", "Image position", ["left", "right"], { default: "right" }), cta("cta", "Section button")]),
  "services:grid": def("Services — Grid", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:icon-grid": def("Services — Icon Grid", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:list": def("Services — List", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:side-by-side": def("Services — Side by Side", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),
  "services:tabs": def("Services — Tabs", [...sectionHeader(), ...listControls(), cta("cta", "Section button")]),

  // ── STATS ────────────────────────────────────────────────────────────────────
  "stats:cards": def("Stats — Cards", [...sectionHeader(), stats()]),
  "stats:counters": def("Stats — Counters", [...sectionHeader(), stats()]),
  "stats:split": def("Stats — Split", [...sectionHeader(), markdown("body", "Body"), stats()]),

  // ── TEAM (inline) ────────────────────────────────────────────────────────────
  "team:cards-detailed": def("Team — Cards Detailed", [...sectionHeader(), teamMembers()]),
  "team:carousel": def("Team — Carousel", [...sectionHeader(), teamMembers()]),
  "team:compact": def("Team — Compact", [...sectionHeader(), teamMembers()]),
  "team:featured": def("Team — Featured", [...sectionHeader(), teamMembers()]),
  "team:grid": def("Team — Grid", [...sectionHeader(), teamMembers()]),
  "team:list": def("Team — List", [...sectionHeader(), teamMembers()]),

  // ── TRUST BAR ────────────────────────────────────────────────────────────────
  "trust-bar:badges": def("Trust Bar — Badges", [...sectionHeader(), certItems()]),
  "trust-bar:inline": def("Trust Bar — Inline", [inlineItems()]),
  "trust-bar:logos": def("Trust Bar — Logos", [str("heading", "Heading"), logos()]),
  "trust-bar:marquee": def("Trust Bar — Marquee", [logos(), stringlist("items", "Text items")]),
  "trust-bar:ratings": def("Trust Bar — Ratings", [...sectionHeader(), ratingSources()]),
  "trust-bar:stats": def("Trust Bar — Stats", [...sectionHeader(), stats()]),
  "about:owner-letter": def("About — Owner Letter", [...sectionHeader(), markdown('body','Letter'), image(), str('signatureName','Signature name'), str('signatureRole','Signature role'), cta(), cta('secondaryCta','Secondary button')]),
  "about:numbers-collage": def("About — Numbers Collage", [...sectionHeader(), stats(), list('images','Photos',[str('src','Image path'),str('alt','Alt text')]), cta()]),
  "about:credentials": def("About — Credentials Strip", [...sectionHeader(), markdown('body','Body'), list('credentials','Credentials',[str('label','Label'),str('issuer','Issuer'),text('description','Description')]), cta()]),
  "about:image-overlap": def("About — Image Overlap", [...sectionHeader(), markdown('body','Body'), image(), image('imageBack','Back image'), stringlist('bullets','Bullets'), cta(), cta('secondaryCta','Secondary button')]),
  "about:promise": def("About — Promise Pledge", [...sectionHeader(), featureItems(), cta()]),
  "content:lead-article": def("Content — Lead Article", [...sectionHeader(), text('lead','Lead paragraph'), markdown('body','Body'), cta(), cta('secondaryCta','Secondary button')]),
  "content:sidebar": def("Content — Sidebar", [...sectionHeader(), markdown('body','Body'), str('sidebarTitle','Sidebar title'), list('links','Sidebar links',[str('label','Label'), str('href','Link')]), cta()]),
  "content:stat-interrupt": def("Content — Stat Interrupt", [...sectionHeader(), markdown('bodyTop','Intro body'), stats(), markdown('bodyBottom','Continued body')]),
  "content:quote-band": def("Content — Quote Band", [eyebrow(), text('quote','Quote'), str('attribution','Attribution'), str('role','Role'), image(), select('imagePosition','Image position',['left','right'],{default:'left'}), cta()]),
  "content:qa": def("Content — Q&A", [...sectionHeader(), list('items','Questions',[str('question','Question'), markdown('answer','Answer')]), cta()]),
  "cta:urgency-band": def("CTA — Urgency Band", [...sectionHeader(), str("deadlineNote", "Deadline note"), cta(), cta("secondaryCta", "Secondary button")]),
  "cta:choose-path": def("CTA — Choose Your Path", [...sectionHeader(), list("paths", "Paths", [str("icon", "Icon (emoji)"), str("title", "Title"), text("body", "Body"), cta("cta", "Button")])]),
  "cta:image-card": def("CTA — Image Card", [...sectionHeader(), image(), select("cardAlign", "Card alignment", ["left", "center", "right"], { default: "left" }), cta(), cta("secondaryCta", "Secondary button")]),
  "cta:stat-backed": def("CTA — Stat Backed", [...sectionHeader(), stats(), cta(), cta("secondaryCta", "Secondary button")]),
  "cta:guarantee": def("CTA — Guarantee", [...sectionHeader(), str("sealText", "Seal text"), stringlist("bullets", "Guarantee points"), cta(), cta("secondaryCta", "Secondary button")]),
  "feature:bento": def("Feature — Bento Grid", [...sectionHeader(), featureItems()]),
  "feature:sticky-list": def("Feature — Sticky List", [...sectionHeader(), featureItems(), cta(), cta('secondaryCta','Secondary button')]),
  "feature:spotlight": def("Feature — Numbered Spotlight", [...sectionHeader(), featureItems(), cta()]),
  "feature:media-rail": def("Feature — Media + Stat Rail", [...sectionHeader(), featureItems(), stats(), image(), select('imagePosition','Image position',['left','right'],{ default: 'right' }), cta()]),
  "feature:strip": def("Feature — Icon Strip", [...sectionHeader(), featureItems()]),
  "gallery:strip": def("Gallery — Full-Bleed Strip", [...sectionHeader(), galleryImages()]),
  "gallery:project-cards": def("Gallery — Project Cards", [...sectionHeader(), num('columns', 'Columns'), galleryImages()]),
  "gallery:showcase": def("Gallery — Showcase", [...sectionHeader(), galleryImages()]),
  "gallery:polaroid": def("Gallery — Polaroid Stack", [...sectionHeader(), galleryImages()]),
  "gallery:recent-jobs": def("Gallery — Recent Jobs", [...sectionHeader(), cta(), galleryImages()]),
  "process:zigzag": def("Process — Zig-Zag Path", [...sectionHeader(), processSteps()]),
  "process:big-number": def("Process — Big Number", [...sectionHeader(), processSteps(), cta(), cta('secondaryCta', 'Secondary button'), bool('showPhone', 'Show phone link')]),
  "process:phased": def("Process — Phased Timeline", [...sectionHeader(), list('steps', 'Steps', [str('phase', 'Phase'), str('heading', 'Heading'), text('body', 'Body')])]),
  "process:stepper": def("Process — Progress Stepper", [...sectionHeader(), processSteps(), num('current', 'Highlight up to step #')]),
  "process:checklist": def("Process — How-It-Works Checklist", [...sectionHeader(), str('listTitle', 'List title'), processSteps(), cta(), cta('secondaryCta', 'Secondary button'), bool('showPhone', 'Show phone link')]),
  "benefits:alternating": def("Benefits — Alternating", [...sectionHeader(), featureItems()]),
  "benefits:problem-solution": def("Benefits — Problem to Solution", [...sectionHeader(), str('problemLabel','Problem label'), str('solutionLabel','Solution label'), list('pairs','Problem / solution pairs', [text('problem','Problem'), text('solution','Solution'), text('detail','Detail')])]),
  "benefits:stat-cards": def("Benefits — Stat Cards", [...sectionHeader(), list('items','Stat benefits', [str('stat','Stat'), str('title','Title'), text('body','Body'), str('icon','Icon')])]),
  "benefits:big-icon-trio": def("Benefits — Big Icon Trio", [...sectionHeader(), featureItems()]),
  "benefits:cta-panel": def("Benefits — CTA Panel", [...sectionHeader(), featureItems(), str('panelHeading','Panel heading'), text('panelBody','Panel body'), bool('showPhone','Show phone'), cta('cta','Primary button'), cta('secondaryCta','Secondary button')]),
  "comparison:us-vs-them-cards": def("Comparison — Us vs Them Cards", [...sectionHeader(), str('usLabel','Our label'), str('usTagline','Our tagline'), str('themLabel','Their label'), str('themTagline','Their tagline'), comparisonRows(), cta(), cta('secondaryCta','Secondary button')]),
  "comparison:what-sets-us-apart": def("Comparison — What Sets Us Apart", [...sectionHeader(), featureItems(), cta(), cta('secondaryCta','Secondary button')]),
  "comparison:cost-of-cutting-corners": def("Comparison — Cost of Cutting Corners", [...sectionHeader(), str('usLabel','Our label'), str('usPrice','Our price'), str('usNote','Our note'), str('themLabel','Their label'), str('themPrice','Their price'), str('themNote','Their note'), comparisonRows(), cta(), cta('secondaryCta','Secondary button')]),
  "comparison:diy-vs-pro": def("Comparison — DIY vs Pro", [...sectionHeader(), str('usLabel','Our label'), str('themLabel','Their label'), str('footnote','Footnote'), comparisonRows(), cta(), cta('secondaryCta','Secondary button')]),
  "comparison:before-hiring-checklist": def("Comparison — Before Hiring Checklist", [...sectionHeader(), str('usLabel','Our label'), str('assuranceTitle','Assurance title'), text('assuranceBody','Assurance body'), featureItems(), cta(), cta('secondaryCta','Secondary button')]),
  "pricing:starting-at": def("Pricing — Starting-At Range", [...sectionHeader(), str('startingLabel','Starting label'), str('priceLow','Low price'), str('priceHigh','High price'), str('unit','Unit'), text('note','Note'), stringlist('highlights','Highlights'), cta(), cta('secondaryCta','Secondary button')]),
  "pricing:price-list": def("Pricing — Service Price List", [...sectionHeader(), pricingPlans('items','Services'), text('footnote','Footnote'), cta('secondaryCta','Secondary button')]),
  "pricing:financing": def("Pricing — Financing Callout", [...sectionHeader(), str('monthlyPrice','Monthly price'), str('monthlyUnit','Monthly unit'), text('termNote','Term note'), str('financingLabel','Financing label'), stringlist('bullets','Bullets'), text('disclaimer','Disclaimer'), cta(), cta('secondaryCta','Secondary button')]),
  "pricing:quote": def("Pricing — Quote CTA + Sample Ranges", [...sectionHeader(), str('rangesTitle','Ranges title'), estimateRows(), text('trustNote','Trust note'), text('disclaimer','Disclaimer'), cta(), cta('secondaryCta','Secondary button')]),
  "pricing:bands": def("Pricing — Good/Better/Best Bands", [...sectionHeader(), pricingPlans(), text('footnote','Footnote'), cta('secondaryCta','Secondary button')]),
  "stats:spotlight": def("Stats — Spotlight", [...sectionHeader(), stats(), cta(), cta('secondaryCta','Secondary button')]),
  "stats:bar": def("Stats — Bar", [...sectionHeader(), stats()]),
  "stats:icon-grid": def("Stats — Icon Grid", [...sectionHeader(), list('stats','Stats',[str('icon','Icon (emoji)'), str('value','Value'), str('label','Label'), text('description','Description')])]),
  "stats:comparison": def("Stats — Before / After", [...sectionHeader(), str('beforeLabel','Before label'), str('afterLabel','After label'), list('metrics','Metrics',[str('label','Metric'), str('before','Before value'), str('after','After value'), text('description','Description')]), cta(), cta('secondaryCta','Secondary button')]),
  "stats:band": def("Stats — Accent Band", [...sectionHeader(), stats(), cta(), cta('secondaryCta','Secondary button')]),
  "team:owner-spotlight": def("Team — Owner Spotlight", [...sectionHeader(), object('owner','Owner',[str('name','Name'),str('role','Role'),str('photo','Photo path'),text('bio','Bio'),text('quote','Pull quote'),str('signature','Signature line')]), cta()]),
  "team:roster-strip": def("Team — Roster Strip", [...sectionHeader(), teamMembers()]),
  "team:crew-group": def("Team — Crew Group", [...sectionHeader(), image('groupPhoto','Group photo'), teamMembers()]),
  "team:specialty-cards": def("Team — Specialty Cards", [...sectionHeader(), list('members','Members',[str('name','Name'),str('role','Role'),str('photo','Photo path'),text('bio','Bio'),str('specialty','Specialty tag')])]),
  "team:hiring-panel": def("Team — Hiring Panel", [...sectionHeader(), teamMembers(), str('hiringHeading','Hiring heading'), text('hiringBody','Hiring body'), cta(), cta('secondaryCta','Secondary button')]),
  "trust-bar:rating-callout": def("Trust Bar — Rating Callout", [num('rating','Rating'), num('count','Review count'), str('sourceName','Source name'), str('label','Label'), cta()]),
  "trust-bar:count-strip": def("Trust Bar — Count Strip", [str('prefix','Prefix text'), str('count','Count'), str('suffix','Suffix text'), stringlist('points','Supporting points')]),
  "trust-bar:as-featured-in": def("Trust Bar — As Featured In", [str('heading','Heading'), logos()]),
  "trust-bar:cert-chips": def("Trust Bar — Certification Chips", [str('heading','Heading'), certItems()]),
  "trust-bar:guarantee-strip": def("Trust Bar — Guarantee Strip", [str('seal','Seal text'), str('heading','Heading'), text('body','Body'), stringlist('points','Guarantee points'), cta()]),
  "faqs:disclosure": def("FAQs — Disclosure List", [...sectionHeader(), num('limit','Max items'), str('service','Filter by service')]),
  "faqs:contact-split": def("FAQs — Contact Split", [...sectionHeader(), num('limit','Max items'), str('service','Filter by service'), cta('cta','Contact button')]),
  "faqs:numbered": def("FAQs — Numbered", [...sectionHeader(), num('limit','Max items'), str('service','Filter by service')]),
  "faqs:grid-compact": def("FAQs — Compact Grid", [...sectionHeader(), num('limit','Max items'), str('service','Filter by service')]),
  "faqs:feature": def("FAQs — Feature", [...sectionHeader(), num('limit','Max items'), str('service','Filter by service')]),
  "reviews:spotlight": def("Reviews — Spotlight", [...sectionHeader(), num('limit','Max items',{default:6}), select('filter','Show',['all','featured'],{default:'featured'}), str('service','Filter by service slug')]),
  "reviews:wall": def("Reviews — Wall", [...sectionHeader(), num('limit','Max items',{default:8}), select('filter','Show',['all','featured'],{default:'all'}), str('service','Filter by service slug')]),
  "reviews:marquee": def("Reviews — Marquee", [...sectionHeader(), num('limit','Max items',{default:8}), select('filter','Show',['all','featured'],{default:'all'}), str('service','Filter by service slug')]),
  "reviews:verified": def("Reviews — Verified", [...sectionHeader(), num('limit','Max items',{default:6}), select('filter','Show',['all','featured'],{default:'all'}), str('service','Filter by service slug')]),
  "reviews:band": def("Reviews — Star Band", [...sectionHeader(), num('limit','Max items',{default:4}), select('filter','Show',['all','featured'],{default:'featured'}), str('service','Filter by service slug')]),
  "service-areas:chips": def("Service Areas — City Chip Cloud", [...sectionHeader(), num('limit','Max items')]),
  "service-areas:columns": def("Service Areas — Multi-Column List", [...sectionHeader(), num('limit','Max items')]),
  "service-areas:featured-split": def("Service Areas — Featured City + Surrounding", [...sectionHeader(), num('limit','Max surrounding items')]),
  "service-areas:map-chips": def("Service Areas — Map + Chip Strip", [...sectionHeader(), num('limit','Max items'), str('mapEmbedUrl','Map embed URL')]),
  "service-areas:directory": def("Service Areas — A–Z Directory", [...sectionHeader(), num('limit','Max items')]),
  "services:bento": def("Services — Bento Grid", [...sectionHeader(), num('limit','Max items'), cta('cta','Section button')]),
  "services:numbered": def("Services — Numbered List", [...sectionHeader(), num('limit','Max items'), cta('cta','Section button')]),
  "services:sidebar-cta": def("Services — Sidebar CTA", [...sectionHeader(), num('limit','Max items'), cta('cta','Sidebar button')]),
  "services:masonry": def("Services — Masonry", [...sectionHeader(), num('limit','Max items'), cta('cta','Section button')]),
  "services:hover-reveal": def("Services — Hover Reveal", [...sectionHeader(), num('limit','Max items'), cta('cta','Section button')]),
  "banner:phone-cta": def("Banner — Phone CTA Top Bar", [str('text','Message'), str('hoursNote','Hours Note'), cta()]),
  "banner:promo-strip": def("Banner — Promo Offer Strip", [str('icon','Icon (emoji)'), str('badge','Badge'), str('text','Offer Text'), str('code','Promo Code'), cta()]),
  "banner:weather-alert": def("Banner — Storm / Weather Alert", [str('label','Label'), text('text','Alert Text'), cta(), bool('dismissible','Dismissible')]),
  "banner:financing": def("Banner — Financing Available Strip", [str('headline','Headline'), str('subtext','Subtext'), stringlist('highlights','Highlights'), cta()]),
  "banner:review-rating": def("Banner — Review Rating Micro-Bar", [num('rating','Rating'), num('count','Review Count'), str('source','Source'), str('text','Blurb'), cta()]),
  "certifications:detail-cards": def("Certifications — Detail Cards", [...sectionHeader(), certItems('items','Certifications')]),
  "certifications:partner-showcase": def("Certifications — Manufacturer Partner Showcase", [...sectionHeader(), certItems('items','Manufacturer Partners')]),
  "certifications:credential-list": def("Certifications — License & Insurance Credential List", [...sectionHeader(), str('verifyLabel','Verify link label'), list('items','Credentials', [str('label','Name'), text('description','Description'), str('logo','Logo path'), str('credentialId','Credential / license #'), str('verifyUrl','Verify URL')])]),
  "certifications:split-copy": def("Certifications — Two-Column Certs + Trust Copy", [...sectionHeader(), text('body','Body copy'), stringlist('bullets','Bullet points'), cta('cta','Button'), bool('flip','Badges on left (large screens)'), certItems('items','Certifications')]),
  "certifications:cta-panel": def("Certifications — Badges + CTA Panel", [...sectionHeader(), cta('cta','Primary button'), cta('secondaryCta','Secondary button'), certItems('items','Certifications')]),
  "contact:form-trust": def("Contact — Form + Trust Panel", [...sectionHeader(),stringlist('trustPoints','Trust points'),form()]),
  "contact:hours-map-form": def("Contact — Hours, Map & Form", [...sectionHeader(),str('mapEmbedUrl','Map embed URL'),form()]),
  "contact:emergency": def("Contact — Emergency Panel", [...sectionHeader(),str('phone','Phone override'),stringlist('points','Assurance points'),cta()]),
  "contact:callback": def("Contact — Request a Callback", [...sectionHeader(),bool('showPhone','Show call-now link'),form()]),
  "contact:banner": def("Contact — Phone & CTA Banner", [...sectionHeader(),cta(),bool('showHours','Show today hours')]),
  "guarantee:seal-spotlight": def("Guarantee — Warranty Seal Spotlight", [...sectionHeader(), str('seal','Seal text'), stringlist('bullets','Covered points'), cta('cta','Primary button'), cta('secondaryCta','Secondary button')]),
  "guarantee:card-grid": def("Guarantee — Multi-Guarantee Card Grid", [...sectionHeader(), featureItems('items','Guarantees')]),
  "guarantee:promise-signature": def("Guarantee — Owner Promise & Signature", [eyebrow(), str('heading','Heading'), text('body','Promise'), str('seal','Seal text'), str('signatureName','Signature name'), str('signatureRole','Signature role')]),
  "guarantee:image-split": def("Guarantee — Image Split with Seal", [eyebrow(), str('heading','Heading'), text('body','Body'), stringlist('bullets','Covered points'), str('seal','Overlay seal text'), image(), bool('imageRight','Image on right'), cta('cta','Primary button'), cta('secondaryCta','Secondary button')]),
  "guarantee:pledge-banner": def("Guarantee — Money-Back Pledge Banner", [eyebrow(), str('heading','Heading'), text('body','Body'), stringlist('bullets','Numbered pledges'), cta('cta','Primary button'), cta('secondaryCta','Secondary button'), bool('showPhone','Show phone')]),
  "location:map-overlay": def("Location — Map With Overlay Card", [...sectionHeader(), str('mapEmbedUrl','Map embed URL'), str('cardTitle','Info card title'), cta('cta','Directions button')]),
  "location:directions-cta": def("Location — Get Directions CTA", [...sectionHeader(), str('mapEmbedUrl','Map embed URL'), text('note','Arrival / parking note'), cta('cta','Primary button'), cta('secondaryCta','Secondary button')]),
  "location:multi": def("Location — Multi-Location Grid", [...sectionHeader(), list('locations','Locations',[str('name','Name'),str('address','Address'),str('phone','Phone'),str('hoursNote','Hours note'),str('mapUrl','Map / directions URL')])]),
  "location:map-hours-cta": def("Location — Map, Hours & CTA", [...sectionHeader(), str('mapEmbedUrl','Map embed URL'), cta('cta','Directions button')]),
  "location:service-area": def("Location — Service Area Coverage", [...sectionHeader(), str('mapEmbedUrl','Map embed URL'), stringlist('areas','Service areas'), text('footnote','Coverage footnote'), cta('cta','Primary button')]),
  "services:by-category": def("Services — By Category", [...sectionHeader(), num("limit", "Max per category"), stringlist("categories", "Only these category slugs (in order; blank = all)"), cta("cta", "Section button")]),
  "services:category-tabs": def("Services — Category Tabs", [...sectionHeader(), num("limit", "Max per category"), cta("cta", "Section button")]),
  "services:category-cards": def("Services — Category Cards", [...sectionHeader(), num("perCategory", "Services listed per card"), cta("cta", "Section button")]),
  "services:category-filter": def("Services — Category Filter", [...sectionHeader(), num("limit", "Max services"), str("allLabel", "'All' pill label"), cta("cta", "Section button")]),
  // GEN:variant-fields
};

export default sectionFields;
