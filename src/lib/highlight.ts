// Inline emphasis for plain-string heading fields. Editors write simple tokens
// in the CMS (no HTML): `==text==` → theme-accent span, `**text**` → bold.
// Input is HTML-escaped first, so the returned string is safe for `set:html`.
//
//   <h1 set:html={highlight(data.heading)} />
//
// Example: "Trusted Roofing ==You Can Count On==" → the second part in accent color.

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Render heading emphasis tokens to safe HTML. Returns "" for empty input. */
export function highlight(input?: string | null): string {
  if (input == null || input === "") return "";
  return esc(String(input))
    .replace(/==(.+?)==/g, '<span class="heading-em">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
