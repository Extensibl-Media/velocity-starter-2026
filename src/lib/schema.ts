import type {
  WebSite,
  LocalBusiness,
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  WithContext,
  SearchAction,
} from "schema-dts";

export interface BusinessData {
  businessName: string;
  tagline?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  gbpUrl?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface SiteData {
  url: string;
  ogImage: string;
}

export function createWebsiteSchema(
  business: BusinessData,
  site: SiteData
): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: business.businessName,
    url: site.url,
    description: business.tagline,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      "query-input": {
        "@type": "PropertyValueSpecification",
        valueRequired: true,
        valueName: "search_term_string",
      },
    } as SearchAction,
  };
}

export function createLocalBusinessSchema(
  business: BusinessData,
  site: SiteData,
  options?: {
    businessType?: string;
    priceRange?: string;
    openingHours?: string[];
    areaServed?: string[];
    image?: string;
  }
): WithContext<LocalBusiness> {
  const socialLinks = Object.values(business.social || {}).filter(
    Boolean
  ) as string[];
  if (business.gbpUrl) socialLinks.push(business.gbpUrl);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.businessName,
    url: site.url,
    telephone: business.phone,
    email: business.email,
    image: options?.image || `${site.url}${site.ogImage}`,
    logo: `${site.url}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zip,
      addressCountry: "US",
    },
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
    priceRange: options?.priceRange,
    openingHours: options?.openingHours,
    areaServed: options?.areaServed?.map((area) => ({
      "@type": "City",
      name: area,
    })),
  };
}

export function createBlogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author: { name: string; url?: string };
  businessName: string;
  siteUrl: string;
}): WithContext<BlogPosting> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: post.url,
    image: post.image,
    datePublished: post.datePublished.toISOString(),
    dateModified:
      post.dateModified?.toISOString() || post.datePublished.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: post.businessName,
      logo: {
        "@type": "ImageObject",
        url: `${post.siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.url,
    },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
