// section-builder — server entrypoint (native plugin).
// A field-widget plugin needs no server hooks/routes; the widget is pure admin
// UI over a `json` field. The `admin` config drives the runtime manifest:
//   admin.entry present  → adminMode "react"
//   admin.fieldWidgets    → the widgets the admin can bind to fields
// (The actual React module is imported build-time via the descriptor's adminEntry.)
import { definePlugin } from "emdash";

export function createPlugin() {
  return definePlugin({
    id: "section-builder",
    version: "0.1.0",
    admin: {
      entry: "section-builder/admin",
      fieldWidgets: [
        { name: "pageBuilder", label: "Page Builder", fieldTypes: ["json"] },
      ],
    },
  });
}

export default createPlugin;
