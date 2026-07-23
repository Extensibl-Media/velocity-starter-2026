# Section Manifest

A catalog of the page sections found across most local-services and marketing websites, mapped to this repo's `group:variant` engine. Use it as the roadmap for growing the section library.

**How to read it**
- **`group:variant`** — the registry key you'd add in [`src/lib/sectionRegistry.ts`](../src/lib/sectionRegistry.ts).
- **Status:** ✅ built (in the registry today) · ➕ gap (recommended to build).
- **Data** — the rough `data` shape the section would read (JSON authored per page).
- Priority tags: **P1** = build next (high-value for local-services), **P2** = common, **P3** = nice-to-have.

Every section receives `{ theme, data }` and must be theme-pure (tokens only). New variants belong in the shared library — never forked per site.

**Today: 237 section variants across 22 groups**, plus **10 header + 10 footer chrome variants**. This planning doc predates the current library; the **canonical live catalog is [`/components`](/components)** (every section) + [`/components/chrome`](/components/chrome) (every header/footer), and the source of truth is [`src/lib/sectionRegistry.ts`](../src/lib/sectionRegistry.ts) / [`layoutRegistry.ts`](../src/lib/layoutRegistry.ts). Every group now carries 8–16 variants; the tables below are only the original ~55-item roadmap.

> **Content is stored/edited in EmDash (Cloudflare D1).** A page's `sections` array is a `json` field
> holding `[{type, theme, data}]`; `PageRenderer` looks each `type` up in the section registry. When you
> add a section variant, register it in [`src/lib/sectionRegistry.ts`](../src/lib/sectionRegistry.ts)
> (import + `"group:variant"` key). (A richer per-section editing UI in the EmDash admin is a planned
> plugin — see [decisions/0001-cms-decap-to-emdash.md](decisions/0001-cms-decap-to-emdash.md).)

---

## 1. Hero — above-the-fold header

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `hero:split-form` | ✅ | Content left, lead form right | Home/contact — capture leads immediately | eyebrow, heading, subheading, body, trustBadges[], ctas[], backgroundImage |
| `hero:image-overlay` | ✅ | Full-bleed image + dark overlay + heading | Service/geo pages | heading, subheading, ctas[], backgroundImage, showPhone |
| `hero:full` | ✅ | Full-viewport centered | Bold brand landing | heading, subheading, ctas[] |
| `hero:minimal` | ✅ | Compact page header | About/legal/interior pages | headline, subheadline, cta, secondaryCta |
| `hero:stacked-form` | ✅ | Centered content, form beneath | Single-CTA landing pages | heading, subheading, form fields |
| `hero:video` | ✅ | Muted background video + overlay | High-production brands | videoSrc, poster, heading, ctas[] |
| `hero:carousel` | ➕ P3 | Rotating slides | Multi-message home | slides[]{image, heading, cta} |

## 2. Trust bar / social proof — thin credibility strip

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `trust-bar:badges` | ✅ | Row of trust chips (rating, years, licensed) | Directly under hero | foundingYear, googleRating, reviewCount, familyOwned, licensedInsured |
| `trust-bar:logos` | ✅ | "As seen in" / brand logo row | Establish authority | logos[]{src, alt} |
| `trust-bar:stats` | ✅ | Big-number stat row | Quantify credibility | stats[]{value, label} |
| `trust-bar:ratings` | ✅ | Aggregate stars + source logos (Google/FB/Yelp) | Review-heavy businesses | sources[]{name, rating, count, url} |
| `certifications:grid` | ✅ | Grid of license/insurance/manufacturer badges | Trades requiring proof | items[]{logo, label} |

## 3. Services / offerings

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `services:grid` | ✅ | Uniform card grid (from `services` collection) | Services overview | eyebrow, heading, limit |
| `services:cards` | ✅ | Richer cards w/ image + description | Featured services | heading, items[] |
| `services:list` | ✅ | Compact vertical list | Dense service menus | heading, items[] |
| `services:side-by-side` | ✅ | Image one side, service copy + CTA other | Home teaser | heading, image, imagePosition, cta |
| `services:tabs` | ✅ | Tabbed categories of services | Businesses with grouped offerings | tabs[]{label, items[]} |
| `services:accordion` | ✅ | Expandable service rows | Long service catalogs | items[]{title, body} |

## 4. About / brand story

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `about:split` | ✅ | Text + image, two columns | Standard about block | heading, body, image, cta |
| `about:stacked` | ✅ | Centered stacked story | Short brand intro | heading, body |
| `about:why-choose-us` | ✅ | Story + stats + image + overlay badge | Differentiation on home/about | heading, body, image, stats[], overlayText, cta |
| `about:timeline` | ✅ | Company-history milestones | Established firms | milestones[]{year, title, body} |
| `team:grid` | ✅ | Headshot cards + name/role/bio | Trust via faces | members[]{photo, name, role, bio} |

## 5. Process / how it works

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `process:numbered` | ✅ | Numbered step cards | "How it works" | heading, steps[]{heading, body} |
| `process:horizontal` | ✅ | Left-to-right connected steps | Wide desktop flow | heading, steps[] |
| `process:vertical` | ✅ | Top-to-bottom connected steps | Mobile-friendly flow | heading, steps[] |

## 6. Reviews / testimonials

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `reviews:cards` | ✅ | Review card grid (from `reviews` collection) | Social proof block | heading, filter, limit |
| `reviews:featured` | ✅ | One large testimonial + photo | Hero testimonial | author, location, rating, source, body, image |
| `reviews:masonry` | ✅ | Staggered masonry wall | Lots of short reviews | heading, limit |
| `reviews:carousel` | ✅ | Sliding testimonial track | Space-constrained proof | items[] |
| `reviews:quote` | ✅ | Single oversized pull-quote | Punchy endorsement | quote, attribution |

## 7. Pricing

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `pricing:tiers` | ✅ | 3-column plan cards + highlighted tier | Package-based services | plans[]{name, price, features[], cta, highlighted} |
| `pricing:table` | ✅ | Feature-comparison matrix | Detailed plan compare | columns[], rows[] |
| `pricing:single` | ✅ | One offer + inclusions list | Single-package businesses | price, inclusions[], cta |
| `pricing:estimate` | ✅ | "Starting at" ranges per service | Trades without fixed prices | rows[]{service, from, note} |

## 8. FAQ

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `faqs:accordion` | ✅ | Expandable Q&A (from `faqs` collection) + `FAQPage` JSON-LD | Objection handling | heading, service (filter) |
| `faqs:stacked` | ✅ | Always-open stacked Q&A | Short FAQ lists | heading, items[] |
| `faqs:two-column` | ✅ | Grouped Q&A in two columns | Long FAQ pages | groups[]{heading, items[]} |

## 9. Service areas / location

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `service-areas:map-split` | ✅ | Map one side, area list + CTA other | Coverage on home/contact | heading, body, coverageNote, featuredOnly, cta |
| `service-areas:grid` | ✅ | City link cards (from `service-areas`) | Geo-SEO internal linking | heading, featuredOnly, limit |
| `service-areas:list` | ✅ | Simple linked city list | Compact coverage footer-ish block | columns |
| `location:map-embed` | ✅ | Embedded map + address + hours | Single-location businesses | address, mapEmbed, hours |

## 10. Gallery / work / portfolio

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `gallery:grid` | ✅ | Photo grid + lightbox | Show finished work | images[]{src, alt} |
| `gallery:before-after` | ✅ | One or two large draggable before/after sliders | Trades with visible results | pairs[]{before, after, label} |
| `gallery:before-after-grid` | ✅ | Responsive grid (default 3-col) of before/after sliders | Show many transformations at once | columns, pairs[]{before, after, label} |
| `portfolio:masonry` | ➕ P3 | Masonry project wall | Design/creative work | items[] |
| `projects:featured` | ➕ P3 | Case-study spotlight w/ details | Highlight a marquee job | title, image, summary, stats[] |

## 11. Content / feature blocks

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `content:rich-text` | ✅ | Prose block (Markdown/MDX) | Legal, long-form, SEO copy | body |
| `benefits:tabs` | ✅ | Interactive vertical tabs (LAB Differentiation Triad) | Benefits/differentiators | tabs[]{label, heading, body, bullets, image} |
| `feature:list` | ✅ | Icon + title + text grid | Feature/benefit highlights | items[]{icon, title, body} |
| `feature:alternating` | ✅ | Zig-zag text/media rows | Explain multiple features | rows[]{heading, body, image, side} |
| `stats:counters` | ✅ | Count-up animated number row | Impact metrics (proof) | stats[]{value, label} |
| `video:embed` | ➕ P3 | Embedded explainer video | Product/service demo | provider, id, heading |

## 12. Blog / resources

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `posts:grid` | ➕ P2 | Latest post cards (from `posts` collection) | Blog index / home teaser | heading, limit |
| `posts:featured` | ➕ P3 | One highlighted article | Promote a key post | slug |
| `newsletter:signup` | ➕ P3 | Email capture band | List building | heading, provider |

## 13. Conversion / CTA

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `cta:banner` | ✅ | Full-width color band + CTA | Section-break conversion | heading, subheading, showPhone, ctas[] |
| `cta:centered` | ✅ | Centered CTA w/ optional bg image | Page-end conversion | heading, subheading, showPhone, ctas[] |
| `cta:split` | ✅ | Text left, action right | Mid-page conversion | heading, body, cta |
| `cta:sticky-bar` | ✅ | Persistent bottom/top bar w/ call button | Mobile lead capture | text, phone, cta |
| `banner:announcement` | ✅ | Thin dismissible top strip | Promos, seasonal notices | text, cta, dismissible |

## 14. Contact / lead capture

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `contact:form` | ✅ | Standalone contact form + details | Contact page | heading, subheading, showHours |
| `contact:inline-form` | ✅ | Compact mid-page lead band (LAB §12) | Conversion redundancy mid-page | heading, subheading, showPhone |
| `contact:split` | ➕ P2 | Form one side, map/hours/details other | Full contact page | form, address, hours, mapEmbed |
| `hours:table` | ➕ P2 | Business-hours table (from `hours` setting) | Contact/footer area | (reads hours singleton) |
| `quote:multi-step` | ➕ P3 | Multi-step estimate wizard | Higher-intent lead qualification | steps[]{fields} |

## 15. Differentiation / guarantees

| Section | Status | Layout | Use case | Data |
| --- | --- | --- | --- | --- |
| `comparison:us-vs-them` | ✅ | Two-column check/cross table | Show why you win | rows[]{feature, us, them} |
| `guarantee:callout` | ✅ | Bold warranty/guarantee highlight | Reduce risk objection | heading, body, badge |

---

## Lead forms (the hero form slot)

Lead-capturing heroes (`hero:split-form`, `hero:stacked-form`) have a **form slot** filled by `data.form`. `form.type` selects the sub-component via the **form registry** ([`src/lib/formRegistry.ts`](../src/lib/formRegistry.ts)) — same pattern as the section registry. All forms hold answers in local state and submit the **whole payload once** to a pluggable destination (dispatch a `form:submit` DOM event, optional `submit.endpoint` POST, optional redirect).

| `form.type` | What it is |
| --- | --- |
| `simple` *(default)* | Single-step contact form (name/phone/email/service/message) |
| `quiz` | Multi-step qualifying quiz — `steps[]` of `single-select` / `multi-select` / `scale` / `contact`, with a branched `outcome` (supports `{{stepId}}` tokens). Great for service pages (diagnose → prequalify → capture). |

New video social-proof + owner-intro sections: `reviews:video`, `reviews:video-duo`, `about:owner-video` (lazy YouTube-nocookie embeds).

## Layout Chrome — Header & Footer variants

Not sections — these are the site-wide header and footer, selected **per site** via `headerVariant` / `footerVariant` in [`src/content/settings/general.json`](../src/content/settings/general.json) (resolved through [`src/lib/layoutRegistry.ts`](../src/lib/layoutRegistry.ts)). Defaults: `classic` header, `columns` footer. All mobile-nav wiring is shared via `src/lib/nav.js`.

**Headers (10):** `classic` (default — top bar + logo-left/nav/CTA-right) · `centered` (centered logo, nav beneath) · `minimal` (single row, one CTA) · `transparent` (overlays hero, solid on scroll) · `inverse` (full dark bar) · `two-row` (top contact/CTA row + full-width nav bar) · `pill` (floating rounded pill) · `compact` (ultra-thin single row) · `cta-prominent` (oversized CTA + emphasized phone) · `gradient` (primary-gradient bar).

**Footers (10):** `columns` (default 4-col) · `simple` (compact one-row) · `cta` (CTA band on top) · `newsletter` (columns + signup band) · `map` (NAP + hours + Google Map) · `mega` (newsletter + 5 link columns) · `centered` (centered minimal) · `hours` (prominent hours block) · `social` (social + newsletter forward) · `bar` (ultra-minimal single bar).

## Recommended build order (local-services first)

The **P1 gaps** give the most leverage for the sites you'll build:

1. `content:rich-text` — unblocks legal pages, long-form SEO, and any page that needs prose. Foundational.
2. `contact:form` — a real contact section instead of reusing the hero form.
3. `service-areas:grid` — geo-SEO internal linking (city cards) — core to local-services ranking.
4. `gallery:grid` + `gallery:before-after` — trades live or die on showing work; before/after is the highest-converting proof for roofing, remodeling, landscaping, detailing, etc.

Then the **P2** conversion/credibility set: `cta:sticky-bar`, `banner:announcement`, `trust-bar:ratings`, `pricing:*`, `team:grid`, `feature:alternating`, `comparison:us-vs-them`, `guarantee:callout`.

## Notes on the taxonomy

- Keep `group:variant` naming consistent — the group is the *purpose*, the variant is the *layout*. A new **layout** of an existing purpose is a new variant in the same group; a genuinely new purpose is a new group.
- The section registry and this manifest should stay in sync. When you add a variant, add it in both.
- Every variant reads design tokens only, so a new section automatically works under every theme (Peak Roofing, Harbor, and any future clone).
