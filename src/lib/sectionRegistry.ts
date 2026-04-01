import type { AstroComponentFactory } from "astro/runtime/server/index.js";

// Static imports — required for Astro components
import HeroImageOverlay from "@/components/sections/hero/HeroImageOverlay.astro";
import HeroFull from "@/components/sections/hero/HeroFull.astro";
import HeroSplitForm from "@/components/sections/hero/HeroSplitForm.astro";
import HeroStackedForm from "@/components/sections/hero/HeroStackedForm.astro";
import ServicesGrid from "@/components/sections/services/ServicesGrid.astro";
import ServicesList from "@/components/sections/services/ServicesList.astro";
import ServicesCards from "@/components/sections/services/ServicesCards.astro";
import ProcessNumbered from "@/components/sections/process/ProcessNumbered.astro";
import ProcessHorizontal from "@/components/sections/process/ProcessHorizontal.astro";
import ProcessVertical from "@/components/sections/process/ProcessVertical.astro";
import ReviewsCards from "@/components/sections/reviews/ReviewsCards.astro";
import ReviewsMasonry from "@/components/sections/reviews/ReviewsMasonry.astro";
import ReviewsFeatured from "@/components/sections/reviews/ReviewsFeatured.astro";
import FAQAccordion from "@/components/sections/faqs/FAQAccordion.astro";
import FAQStacked from "@/components/sections/faqs/FAQStacked.astro";
import CTABanner from "@/components/sections/cta/CTABanner.astro";
import CTASplit from "@/components/sections/cta/CTASplit.astro";
import CTACentered from "@/components/sections/cta/CTACentered.astro";
import AboutSplit from "@/components/sections/about/AboutSplit.astro";
import AboutStacked from "@/components/sections/about/AboutStacked.astro";
import TrustBarBadges from "@/components/sections/trust-bar/TrustBarBadges.astro";
import TrustBarLogos from "@/components/sections/trust-bar/TrustBarLogos.astro";
import TrustBarStats from "@/components/sections/trust-bar/TrustBarStats.astro";

export const sectionRegistry: Record<string, AstroComponentFactory> = {
  "hero:image-overlay": HeroImageOverlay,
  "hero:full": HeroFull,
  "hero:split-form": HeroSplitForm,
  "hero:stacked-form": HeroStackedForm,
  "services:grid": ServicesGrid,
  "services:list": ServicesList,
  "services:cards": ServicesCards,
  "process:numbered": ProcessNumbered,
  "process:horizontal": ProcessHorizontal,
  "process:vertical": ProcessVertical,
  "reviews:cards": ReviewsCards,
  "reviews:masonry": ReviewsMasonry,
  "reviews:featured": ReviewsFeatured,
  "faqs:accordion": FAQAccordion,
  "faqs:stacked": FAQStacked,
  "cta:banner": CTABanner,
  "cta:split": CTASplit,
  "cta:centered": CTACentered,
  "about:split": AboutSplit,
  "about:stacked": AboutStacked,
  "trust-bar:badges": TrustBarBadges,
  "trust-bar:logos": TrustBarLogos,
  "trust-bar:stats": TrustBarStats,
};
