import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
// Services
const services = defineCollection({
  loader: glob({
    base: "./src/content/services",
    pattern: "**/*.{md,mdx,markdoc}",
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    image: z.string().optional(),
    isEmergency: z.boolean().default(false),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

// Service Areas
const serviceAreas = defineCollection({
  loader: glob({ base: "./src/content/service-areas", pattern: "**/*.json" }),
  schema: z.object({
    city: z.string(),
    state: z.string(),
    slug: z.string(),
    county: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

// Local Service Pages
const localPages = defineCollection({
  loader: glob({ base: "./src/content/local-pages", pattern: "**/*.json" }),
  schema: z.object({
    area: z.string(),
    service: z.string(),
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    sections: z.array(
      z.discriminatedUnion("type", [
        // Hero
        z.object({
          type: z.literal("hero"),
          heading: z.string(),
          subheading: z.string().optional(),
          cta: z
            .object({
              label: z.string(),
              href: z.string(),
            })
            .optional(),
        }),
        // Services Grid
        z.object({
          type: z.literal("services-grid"),
          heading: z.string(),
          items: z.array(
            z.object({
              heading: z.string(),
              body: z.string(),
              icon: z.string().optional(),
            })
          ),
        }),
        // Reviews
        z.object({
          type: z.literal("reviews"),
          heading: z.string().optional(),
        }),
        // FAQs
        z.object({
          type: z.literal("faqs"),
          heading: z.string().optional(),
        }),
        // CTA Banner
        z.object({
          type: z.literal("cta-banner"),
          heading: z.string(),
          subheading: z.string().optional(),
          cta: z
            .object({
              label: z.string(),
              href: z.string(),
            })
            .optional(),
        }),
        // About
        z.object({
          type: z.literal("about"),
          heading: z.string(),
          body: z.string(),
          image: z.string().optional(),
        }),
        // Process
        z.object({
          type: z.literal("process"),
          heading: z.string(),
          steps: z.array(
            z.object({
              heading: z.string(),
              body: z.string(),
            })
          ),
        }),
      ])
    ),
  }),
});

// FAQs
const faqs = defineCollection({
  loader: glob({ base: "./src/content/faqs", pattern: "**/*.json" }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    service: z.string().optional(),
    order: z.number().default(0),
  }),
});

// Reviews
const reviews = defineCollection({
  loader: glob({ base: "./src/content/reviews", pattern: "**/*.json" }),
  schema: z.object({
    author: z.string(),
    rating: z.number().min(1).max(5),
    body: z.string(),
    date: z.coerce.date(),
    service: z.string().optional(),
    location: z.string().optional(),
    featured: z.boolean().default(false),
    source: z.enum(["Google", "Facebook", "Yelp", "Direct"]).default("Google"),
  }),
});

// Blog Posts
const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.{md,mdx,markdoc}",
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    image: z.string().optional(),
    author: z.string().default("Admin"),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

// Settings - individual files loaded separately
const generalSettings = defineCollection({
  loader: file("./src/content/settings/general.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "general", ...data }];
    },
  }),
  schema: z.object({
    businessName: z.string(),
    tagline: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    license: z.string().optional(),
    gbpUrl: z.string().optional(),
    social: z
      .object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
      })
      .optional(),
  }),
});

const hoursSettings = defineCollection({
  loader: file("./src/content/settings/hours.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "hours", ...data }];
    },
  }),
  schema: z.object({
    hours: z.array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closedAllDay: z.boolean().default(false),
      })
    ),
  }),
});

const seoSettings = defineCollection({
  loader: file("./src/content/settings/seo.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "seo", ...data }];
    },
  }),
  schema: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    googleVerification: z.string().optional(),
    bingVerification: z.string().optional(),
  }),
});

const navigationSettings = defineCollection({
  loader: file("./src/content/settings/navigation.json", {
    parser: (text) => {
      const data = JSON.parse(text);
      return [{ id: "navigation", ...data }];
    },
  }),
  schema: z.object({
    items: z.array(
      z.lazy(() =>
        z.object({
          label: z.string(),
          href: z.string().optional(),
          enabled: z.boolean().default(true),
          autoPopulate: z.enum(["services", "service-areas"]).optional(),
          children: z
            .array(
              z.object({
                label: z.string(),
                href: z.string().optional(),
                enabled: z.boolean().default(true),
                children: z
                  .array(
                    z.object({
                      label: z.string(),
                      href: z.string(),
                      enabled: z.boolean().default(true),
                    })
                  )
                  .optional(),
              })
            )
            .optional(),
        })
      )
    ),
  }),
});

export const collections = {
  services,
  serviceAreas,
  localPages,
  faqs,
  reviews,
  posts,
  generalSettings,
  hoursSettings,
  seoSettings,
  navigationSettings,
};
