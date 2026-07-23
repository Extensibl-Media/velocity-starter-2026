// Descriptor factory for the local section-builder plugin.
// Used in astro.config.mjs: emdash({ plugins: [sectionBuilder()] }).
import { fileURLToPath } from "node:url";

export function sectionBuilder() {
  return {
    id: "section-builder",
    version: "0.1.0",
    format: "native",
    entrypoint: fileURLToPath(new URL("./server.ts", import.meta.url)),
    adminEntry: fileURLToPath(new URL("./admin.tsx", import.meta.url)),
    // Attach the "pageBuilder" field widget to any `json` field that opts in via
    // `widget: "section-builder:pageBuilder"`.
    fieldWidgets: [
      { name: "pageBuilder", label: "Page Builder", fieldTypes: ["json"] },
    ],
  };
}
