import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const sections = [
  // Hero variants
  "hero/HeroFull",
  "hero/HeroImageOverlay",
  "hero/HeroSplitForm",
  "hero/HeroStackedForm",

  // Services variants
  "services/ServicesGrid",
  "services/ServicesList",
  "services/ServicesCards",

  // Process variants
  "process/ProcessNumbered",
  "process/ProcessHorizontal",
  "process/ProcessVertical",

  // Reviews variants
  "reviews/ReviewsCards",
  "reviews/ReviewsMasonry",
  "reviews/ReviewsFeatured",

  // FAQ variants
  "faqs/FAQAccordion",
  "faqs/FAQStacked",

  // CTA variants
  "cta/CTABanner",
  "cta/CTASplit",
  "cta/CTACentered",

  // About variants
  "about/AboutSplit",
  "about/AboutStacked",

  // Trust bar variants
  "trust-bar/TrustBarBadges",
  "trust-bar/TrustBarLogos",
  "trust-bar/TrustBarStats",
];

const placeholder = (name) => `---
// ${name} — placeholder
// Replace with full implementation

interface Props {
  theme?: string;
  data?: Record<string, unknown>;
}

const { theme = 'default', data } = Astro.props;
---

<section class={\`section-wrapper theme-\${theme}\`}>
  <div class="section-container">
    <p class="theme-text-muted text-sm">
      [${name} — not yet implemented]
    </p>
  </div>
</section>
`;

let created = 0;
let skipped = 0;

for (const section of sections) {
  const filePath = join(root, "src/components/sections", `${section}.astro`);
  const dir = dirname(filePath);
  const name = section.split("/")[1];

  await mkdir(dir, { recursive: true });

  try {
    await writeFile(filePath, placeholder(name), { flag: "wx" });
    console.log(`✓ Created ${section}.astro`);
    created++;
  } catch (err) {
    if (err.code === "EEXIST") {
      console.log(`- Skipped ${section}.astro (already exists)`);
      skipped++;
    } else {
      throw err;
    }
  }
}

console.log(`\nDone. ${created} created, ${skipped} skipped.`);
