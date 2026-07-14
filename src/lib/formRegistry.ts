import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import SimpleForm from "@/components/forms/SplitHeroContactForm.astro";
import QuizForm from "@/components/forms/QuizForm.astro";

/**
 * Lead-form sub-components, selected by `form.type` in a form-carrying section's
 * `data.form`. This mirrors the section registry: author `form.type` in page
 * JSON and the hero's form slot renders the matching component via FormRenderer.
 *
 *   simple → single-step contact form (default)
 *   quiz   → multi-step qualifying quiz
 */
export const formRegistry: Record<string, AstroComponentFactory> = {
  simple: SimpleForm,
  quiz: QuizForm,
};

export function resolveForm(type?: string): AstroComponentFactory {
  return formRegistry[type ?? "simple"] ?? SimpleForm;
}
