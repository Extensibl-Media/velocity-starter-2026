import { getCollection } from "astro:content";
import type { BusinessData, SiteData } from "@/lib/schema";
import siteConfig from "@/config/site.config";

export async function getBusinessData(): Promise<BusinessData> {
  try {
    const entries = await getCollection("generalSettings");
    const entry = entries[0];

    if (!entry) throw new Error("No general settings found");

    return entry.data as BusinessData;
  } catch {
    // Fallback to siteConfig during dev before CMS content exists
    return {
      businessName: siteConfig.name,
      tagline: siteConfig.description,
      phone: siteConfig.phone || "",
      email: siteConfig.email,
      address: siteConfig.address?.street || "",
      city: siteConfig.address?.city || "",
      state: siteConfig.address?.state || "",
      zip: siteConfig.address?.zip || "",
    };
  }
}

export function getSiteData(): SiteData {
  return {
    url: siteConfig.url,
    ogImage: siteConfig.ogImage,
  };
}
