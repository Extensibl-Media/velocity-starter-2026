import type { APIRoute } from "astro";

/**
 * Generated robots.txt — references the @astrojs/sitemap output using the site
 * URL from astro.config (`site`), so it stays correct per deploy/domain.
 */
const robotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(robotsTxt(sitemapURL), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
