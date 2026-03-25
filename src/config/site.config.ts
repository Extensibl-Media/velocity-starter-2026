import {
  PUBLIC_GA_MEASUREMENT_ID,
  PUBLIC_GTM_ID,
  PUBLIC_GHL_CHAT_WIDGET_ID,
  PUBLIC_GHL_LOCATION_ID,
} from "astro:env/client";

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  twitter?: {
    site: string;
    creator: string;
  };
  branding: {
    logo: {
      alt: string;
    };
    favicon: {
      svg: string;
    };
    colors: {
      themeColor: string;
      backgroundColor: string;
    };
  };
  analytics: {
    gaMeasurementId?: string;
    gtmId?: string;
  };
  ghl: {
    chatWidgetId?: string;
    locationId?: string;
  };
}

const siteConfig: SiteConfig = {
  // These are demo defaults — client-specific data lives in CMS generalSettings
  name: "Demo Contractor",
  description: "Quality contracting services you can trust.",
  url: import.meta.env.SITE || "https://example.com",
  ogImage: "/og-default.png",
  author: "Extensibl Media",
  branding: {
    logo: {
      alt: "Demo Contractor",
    },
    favicon: {
      svg: "/favicon.svg",
    },
    colors: {
      themeColor: "#1a1a1a",
      backgroundColor: "#ffffff",
    },
  },
  analytics: {
    gaMeasurementId: PUBLIC_GA_MEASUREMENT_ID,
    gtmId: PUBLIC_GTM_ID,
  },
  ghl: {
    chatWidgetId: PUBLIC_GHL_CHAT_WIDGET_ID,
    locationId: PUBLIC_GHL_LOCATION_ID,
  },
};

export default siteConfig;
