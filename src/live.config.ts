import { defineLiveCollection } from "astro:content";
import { emdashLoader } from "emdash/runtime";

// EmDash exposes a single `_emdash` live collection that internally routes to the
// content types defined in EmDash (pages, services, faqs, …). Resolved at runtime
// (SSR) or at build time via getStaticPaths. Replaces the glob/file loaders in
// src/content.config.ts as collections migrate over.
export const collections = {
  _emdash: defineLiveCollection({
    loader: emdashLoader(),
  }),
};
