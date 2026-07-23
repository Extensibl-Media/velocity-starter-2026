import { getServiceCategories, getServices } from "@/lib/content";

/** A service entry as returned by the EmDash adapter. */
type Service = Awaited<ReturnType<typeof getServices>>[number];

/**
 * A category with the services that belong to it, resolved against the
 * `serviceCategories` taxonomy collection (title/description/icon/order).
 */
export interface ServiceGroup {
  /** Category slug (or "__uncategorized__" for services with no category). */
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  services: Service[];
}

const UNCATEGORIZED = "__uncategorized__";

/**
 * Group services by their `category` slug, resolved through the
 * `serviceCategories` collection for display title + ordering.
 *
 * Groups are ordered by the category's `order` (uncategorized last), unless
 * `categories` (a list of category slugs) is passed — then only those groups
 * appear, in that order. Services within a group keep their own `order`.
 * The full service list is returned per group; callers slice/limit as needed.
 */
export async function getServiceGroups(
  categories?: string[],
): Promise<ServiceGroup[]> {
  const [services, cats] = await Promise.all([
    getServices(),
    getServiceCategories(),
  ]);

  const catBySlug = new Map(cats.map((c) => [c.data.slug, c.data]));
  const orderOf = (slug: string) => catBySlug.get(slug)?.order ?? 999;

  const sorted = [...services].sort((a, b) => a.data.order - b.data.order);
  const groupMap = new Map<string, Service[]>();
  for (const service of sorted) {
    const key = service.data.category?.trim() || UNCATEGORIZED;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(service);
  }

  const slugs = categories?.length
    ? categories.filter((s) => groupMap.has(s))
    : [...groupMap.keys()].sort((a, b) => orderOf(a) - orderOf(b));

  return slugs.map((slug) => {
    const cat = catBySlug.get(slug);
    return {
      slug,
      title: cat?.title ?? (slug === UNCATEGORIZED ? "More Services" : slug),
      description: cat?.description,
      icon: cat?.icon,
      services: groupMap.get(slug) ?? [],
    };
  });
}
