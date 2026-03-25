import Hero from "@/components/sections/Hero.astro";
import ServicesGrid from "@/components/sections/ServiceGrid.astro";
import Process from "@/components/sections/Process.astro";
import Reviews from "@/components/sections/Reviews.astro";
import FAQs from "@/components/sections/FAQs.astro";
import About from "@/components/sections/About.astro";
import CTABanner from "@/components/sections/CTABanner.astro";

export const sectionRegistry = {
  hero: Hero,
  "services-grid": ServicesGrid,
  process: Process,
  reviews: Reviews,
  faqs: FAQs,
  about: About,
  "cta-banner": CTABanner,
} as const;

export type SectionType = keyof typeof sectionRegistry;
