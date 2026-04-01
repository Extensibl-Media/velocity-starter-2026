export interface SectionConfig {
  type: string; // e.g. "hero:image-overlay" or "services:grid"
  theme?: "default" | "alt" | "muted" | "inverse";
  data?: Record<string, unknown>;
}

export interface PageConfig {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  sections: SectionConfig[];
}
