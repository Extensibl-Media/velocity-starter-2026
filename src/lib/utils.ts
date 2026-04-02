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
    return {
      businessName: siteConfig.name,
      tagline: siteConfig.description,
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    };
  }
}

export function getSiteData(): SiteData {
  return {
    url: siteConfig.url,
    ogImage: siteConfig.ogImage,
  };
}

export interface NavNode {
  label: string;
  href?: string;
  children?: NavNode[];
}

async function resolveNavItem(
  item: {
    label: string;
    href?: string;
    enabled: boolean;
    autoPopulate?: string;
    children?: Array<{
      label: string;
      href?: string;
      enabled: boolean;
      children?: Array<{ label: string; href: string; enabled: boolean }>;
    }>;
  },
  collections: {
    services: Awaited<ReturnType<typeof getCollection<"services">>>;
    serviceAreas: Awaited<ReturnType<typeof getCollection<"serviceAreas">>>;
    pages: Awaited<ReturnType<typeof getCollection<"pages">>>;
  }
): Promise<NavNode> {
  const { services, serviceAreas, pages } = collections;

  if (item.autoPopulate === "services") {
    const sorted = services.sort((a, b) => a.data.order - b.data.order);
    return {
      label: item.label,
      href: item.href,
      children: sorted.map((s) => ({
        label: s.data.title,
        href: `/services/${s.data.slug}`,
      })),
    };
  }

  if (item.autoPopulate === "service-areas") {
    const sortedAreas = serviceAreas.sort(
      (a, b) => a.data.order - b.data.order
    );
    const sortedServices = services.sort((a, b) => a.data.order - b.data.order);

    // Use pages collection — find pages whose id matches area/service pattern
    const validPages = new Set(
      pages.filter((p) => !p.data.draft).map((p) => p.id)
    );

    const areaNodes: NavNode[] = sortedAreas
      .map((area) => {
        const areaServices = sortedServices.filter((service) =>
          validPages.has(`${area.data.slug}/${service.data.slug}`)
        );

        if (areaServices.length === 0) return null;

        return {
          label: `${area.data.city}, ${area.data.state}`,
          children: areaServices.map((service) => ({
            label: service.data.title,
            href: `/${area.data.slug}/${service.data.slug}`,
          })),
        };
      })
      .filter(Boolean) as NavNode[];

    return {
      label: item.label,
      href: item.href,
      children: areaNodes,
    };
  }

  if (item.children && item.children.length > 0) {
    return {
      label: item.label,
      href: item.href,
      children: item.children
        .filter((child) => child.enabled)
        .map((child) => ({
          label: child.label,
          href: child.href,
          children: child.children
            ?.filter((gc) => gc.enabled)
            .map((gc) => ({
              label: gc.label,
              href: gc.href,
            })),
        })),
    };
  }

  return {
    label: item.label,
    href: item.href,
  };
}

export async function getResolvedNav(): Promise<NavNode[]> {
  try {
    const entries = await getCollection("navigationSettings");
    const entry = entries[0];
    if (!entry) return [];

    const enabledItems = entry.data.items.filter((item) => item.enabled);
    const needsCollections = enabledItems.some((item) => item.autoPopulate);

    const [services, serviceAreas, pages] = await Promise.all([
      needsCollections ? getCollection("services") : Promise.resolve([]),
      needsCollections ? getCollection("serviceAreas") : Promise.resolve([]),
      needsCollections ? getCollection("pages") : Promise.resolve([]),
    ]);

    const collections = { services, serviceAreas, pages };

    return Promise.all(
      enabledItems.map((item) => resolveNavItem(item, collections))
    );
  } catch {
    return [];
  }
}
