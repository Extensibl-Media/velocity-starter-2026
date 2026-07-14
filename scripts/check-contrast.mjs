/**
 * check-contrast.mjs — automated WCAG contrast audit of the theme tokens.
 *
 * Resolves each theme's text/surface/accent/button/badge colors to concrete RGB
 * (handling rgba compositing + color-mix) and computes contrast ratios, so
 * invisible-text / washed-token bugs are caught without opening a browser.
 * Companion to the visual /qa harness.
 *
 *   node scripts/check-contrast.mjs
 *
 * NOTE: values mirror src/styles/theme.css + the theme blocks in global.css.
 * If you retheme or change a theme block, update the palette/THEMES map here.
 */

// ── raw palette (src/styles/theme.css) ───────────────────────────────────────
const H = (h) => {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const P = {
  primary: H("#1b4332"), primaryLight: H("#2d6a4f"),
  secondary: H("#f4a261"), secondaryLight: H("#fddcbc"), secondaryFg: H("#7c2d00"),
  bg: H("#ffffff"), bgAlt: H("#f9fafb"), bgMuted: H("#f3f4f6"), bgInverse: H("#111827"),
  fg: H("#111827"), fgMuted: H("#5f6470"), fgSubtle: H("#767d89"), fgInverse: H("#f9fafb"),
  border: H("#e5e7eb"), white: [255, 255, 255],
};

// ── color ops ────────────────────────────────────────────────────────────────
/** composite an rgba [r,g,b,a] over an opaque bg [r,g,b] */
const over = (fg, bg) => [0, 1, 2].map((i) => Math.round(fg[i] * fg[3] + bg[i] * (1 - fg[3])));
/** color-mix(in srgb, A p%, B) */
const mix = (a, b, pa) => { const p = pa / 100; return [0, 1, 2].map((i) => Math.round(a[i] * p + b[i] * (1 - p))); };
const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (c1, c2) => { const l1 = lum(c1), l2 = lum(c2); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };

// ── per-theme resolved tokens (mirrors global.css theme blocks) ───────────────
const THEMES = {
  default: { bg: P.bg, card: P.bg, heading: P.fg, body: P.fg, muted: P.fgMuted, subtle: P.fgSubtle, accent: P.primary, btnBg: P.primary, btnFg: P.white, badgePill: P.fg, badgeText: P.bg },
  alt: { bg: P.bgAlt, card: P.bg, heading: P.fg, body: P.fg, muted: P.fgMuted, subtle: P.fgSubtle, accent: P.primary, btnBg: P.primary, btnFg: P.white, badgePill: P.fg, badgeText: P.bgAlt },
  muted: { bg: P.bgMuted, card: P.bg, heading: P.fg, body: P.fg, muted: P.fgMuted, subtle: P.fgSubtle, accent: P.primary, btnBg: P.primary, btnFg: P.white, badgePill: P.fg, badgeText: P.bgMuted },
  inverse: { bg: P.bgInverse, card: mix(P.bgInverse, P.white, 93), heading: P.fgInverse, body: P.fgInverse, muted: over([249, 250, 251, 0.7], P.bgInverse), subtle: over([249, 250, 251, 0.4], P.bgInverse), accent: P.secondary, btnBg: P.primaryLight, btnFg: P.white, badgePill: P.fgInverse, badgeText: P.bgInverse },
  primary: { bg: P.primary, card: over([255, 255, 255, 0.1], P.primary), heading: P.white, body: P.white, muted: over([255, 255, 255, 0.7], P.primary), subtle: over([255, 255, 255, 0.4], P.primary), accent: mix(P.secondary, P.white, 65), btnBg: P.white, btnFg: P.primary, badgePill: P.white, badgeText: P.primary },
  "brand-secondary": { bg: P.secondary, card: over([255, 255, 255, 0.5], P.secondary), heading: P.secondaryFg, body: P.secondaryFg, muted: over([124, 45, 0, 0.95], P.secondary), subtle: over([124, 45, 0, 0.82], P.secondary), accent: P.secondaryFg, btnBg: P.primary, btnFg: P.white, badgePill: P.secondaryFg, badgeText: P.white },
};

// pairing → [foreground key, background key, AA threshold, kind]
const CHECKS = [
  ["heading", "bg", 4.5, "text"],
  ["body", "bg", 4.5, "text"],
  ["accent", "bg", 4.5, "text (eyebrow/link)"],
  ["muted", "bg", 4.5, "muted text"],
  ["subtle", "bg", 3.0, "subtle/decorative"],
  ["btnFg", "btnBg", 4.5, "primary button label"],
  ["badgeText", "badgePill", 4.5, "default badge text"],
  // On raised card surfaces (feature/pricing/stat cards etc.)
  ["heading", "card", 4.5, "heading on card"],
  ["body", "card", 4.5, "body on card"],
  ["muted", "card", 4.5, "muted on card"],
  ["accent", "card", 3.0, "accent/icon on card"],
];

let fails = 0, warns = 0;
const rows = [];
for (const [theme, t] of Object.entries(THEMES)) {
  for (const [fgK, bgK, thresh, kind] of CHECKS) {
    const r = ratio(t[fgK], t[bgK]);
    let verdict = "ok";
    if (r < thresh) { verdict = r < 3 ? "FAIL" : "warn"; }
    if (verdict === "FAIL") fails++;
    else if (verdict === "warn") warns++;
    rows.push({ theme, pair: `${fgK} on ${bgK}`, kind, ratio: r.toFixed(2), thresh, verdict });
  }
}

// ── report ───────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log("\nTheme contrast audit (WCAG AA)\n" + "=".repeat(66));
let cur = "";
for (const r of rows) {
  if (r.theme !== cur) { cur = r.theme; console.log(`\n${cur}`); }
  const mark = r.verdict === "FAIL" ? "✗ FAIL" : r.verdict === "warn" ? "~ warn" : "  ok  ";
  console.log(`  ${mark}  ${pad(r.pair, 22)} ${pad(r.ratio + ":1", 8)} (need ${r.thresh})  ${r.kind}`);
}
console.log("\n" + "=".repeat(66));
console.log(`${fails} FAIL (below 3:1 — likely invisible/unreadable), ${warns} warn (below AA but legible).`);
if (fails > 0) console.log("→ FAILs are real contrast bugs. Fix the token or avoid that pairing.");
process.exit(fails > 0 ? 1 : 0);
