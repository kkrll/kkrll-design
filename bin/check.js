#!/usr/bin/env node
/*
 * kkrll-check — the design.md rules that can be found by reading source.
 *
 *     bunx kkrll-check [paths…]        default: src
 *
 * Prints file:line, rule, and the offending text; exits 1 if anything is
 * found. A line is exempt only with a reason: `kkrll-ignore: <why>`, and
 * every exemption is counted in the summary (`--exempt` lists them).
 * Positive letter-spacing cannot be exempted at all.
 * What this cannot see is listed in design.md §6.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo", "coverage"]);
const MARKUP = new Set([".tsx", ".jsx", ".html", ".svelte", ".vue", ".astro"]);
const STYLE = new Set([".css"]);
const SCRIPT = new Set([".ts", ".js", ".mjs"]);

const SCALE = "micro|control|ui|lead|display";
const GLYPHS = "×✕✖✗✓✔→←↑↓↗↘▶▸▾▴◀›‹»«☰⋯";
const PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black";
const COLOR_UTIL = "text|bg|border|border-[trblxy]|ring|ring-offset|outline|fill|stroke|divide|from|via|to|decoration|accent|caret|placeholder|shadow";

/* Each rule: id, which files, and a function from (line, ext) to matches. */
const LINE_RULES = [
  {
    id: "type-scale",
    files: [MARKUP, SCRIPT],
    re: /(?<![\w-])text-(?:xs|sm|base|lg|[2-9]?xl|\[[\d.]+(?:px|rem|em)\])(?![\w-])/g,
  },
  {
    id: "type-scale",
    files: [STYLE, MARKUP],
    re: /(?<![\w-])font-size\s*:(?!\s*(?:var\(--text-|inherit|1em|100%))\s*[^;}"']+/g,
  },
  {
    id: "type-scale",
    files: [MARKUP],
    // Style objects. `fontSize=` on an svg <text> is a drawing, not the scale.
    re: /(?<![\w-])fontSize\s*:(?!\s*["'`]?(?:var\(--text-|inherit))\s*[^,}\n]+/g,
  },
  {
    id: "type-scale",
    files: [STYLE],
    // A size off the scale is declared once, as a named token with a reason.
    re: new RegExp(`(?<![\\w-])--text-(?!(?:${SCALE})(?:--[\\w-]+)?\\s*:)[\\w-]+\\s*:[^;]+`, "g"),
  },
  {
    id: "colour",
    files: [MARKUP, SCRIPT],
    re: new RegExp(`(?<![\\w-])(?:${COLOR_UTIL})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?(?![\\w-])`, "g"),
  },
  {
    id: "colour",
    files: [STYLE, MARKUP],
    // A literal colour outside a custom-property declaration. Declaring a
    // token (`--x: #fff`) is how a palette is defined, so it is allowed.
    skip: /^\s*--[\w-]+\s*:/,
    re: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/g,
  },
  {
    id: "radius",
    files: [MARKUP, SCRIPT],
    re: /(?<![\w-])rounded(?:-[trblse]{1,2})?-\[[^\]]+\]/g,
  },
  {
    id: "shadow",
    files: [MARKUP, SCRIPT],
    re: /(?<![\w-])shadow-(?:sm|md|lg|xl|2xl|inner)(?![\w-])/g,
  },
  {
    id: "motion",
    files: [MARKUP, SCRIPT],
    re: /(?<![\w-])(?:duration-\d+|ease-(?:in|out|in-out|linear))(?![\w-])/g,
  },
  {
    id: "icon-glyph",
    files: [MARKUP],
    // A glyph standing alone as a JSX child or as a whole string literal.
    // `' → '` with spaces is a separator in text, not an icon.
    skip: /^\s*(?:\/\/|\*|\/\*)/,
    re: new RegExp(`>\\s*[${GLYPHS}]\\s*<|(["'])[${GLYPHS}]\\1`, "g"),
  },
  {
    id: "icon-glyph",
    files: [SCRIPT],
    // Plain scripts only count when the glyph is being put on screen.
    re: new RegExp(`(?:textContent|innerText|innerHTML|label)\\s*[:=]\\s*(["'\`])[${GLYPHS}]\\1`, "g"),
  },
  {
    id: "icon-glyph",
    files: [MARKUP],
    re: />\s*\p{Extended_Pictographic}️?\s*</gu,
  },
];

const ICON_SIZES = new Set(["16", "20", "24"]);

/*
 * TRACKING — the rule Claude breaks most, so it is the strictest one. Zero is
 * not a finding. A negative literal may be exempted with a reason; anything
 * positive, a named wide utility, or a value hidden behind a var() may not.
 */
const NUM = /^\s*["'`]?\s*(-?\d*\.?\d+)/;

function trackingValue(raw) {
  const v = raw.trim().replace(/[;,}]+$/, "").trim();
  if (/^["'`]?(?:0(?:px|em|rem)?|normal|inherit|initial|unset)["'`]?$/.test(v)) return "zero";
  if (new RegExp(`^var\\(--text-(?:${SCALE})--letter-spacing\\)$`).test(v)) return "zero";
  const n = v.match(NUM);
  if (n && v.replace(NUM, "").match(/^(?:px|em|rem|%)?["'`]?\s*$/)) {
    const x = Number(n[1]);
    return x === 0 ? "zero" : x < 0 ? "negative" : "positive";
  }
  return "opaque";
}

function checkTracking(text, ext, report) {
  const hit = (match, value) => {
    const kind = trackingValue(value);
    if (kind === "zero") return;
    report(match.trim(), kind !== "negative");
  };
  if (MARKUP.has(ext) || SCRIPT.has(ext)) {
    for (const m of text.matchAll(/(?<![\w-])(-?)tracking-([\w.[\]-]+)/g)) { // kkrll-ignore: the rule's own pattern
      const [, neg, name] = m;
      const arbitrary = name.match(/^\[(.*)\]$/);
      const negative = neg === "-" || /^(?:tight|tighter)$/.test(name) || (arbitrary && /^-/.test(arbitrary[1]));
      report(m[0], !negative);
    }
    for (const m of text.matchAll(/(?<![\w-])letterSpacing\s*[:=]\s*([^,}\n;]+)/g)) hit(m[0], m[1]);
  }
  if (STYLE.has(ext) || MARKUP.has(ext)) {
    for (const m of text.matchAll(/(?<![\w-])letter-spacing\s*:\s*([^;}"']+)/g)) hit(m[0], m[1]);
    for (const m of text.matchAll(/(?<![\w-])letter-spacing=["{]([^"}]+)/g)) hit(m[0], m[1]);
    // Custom properties that smuggle tracking: --tracking-* re-creates the
    // utilities strict.css deletes. A var under any other name is caught where
    // it is used, as an opaque letter-spacing value.
    for (const m of text.matchAll(/(--[\w-]*(?:tracking|letter-spacing)[\w-]*)\s*:\s*([^;}]+)/g)) {
      if (new RegExp(`^--text-(?:${SCALE})--letter-spacing$`).test(m[1])) continue;
      if (m[1].startsWith("--tracking-")) report(m[0], trackingValue(m[2]) !== "negative");
      else hit(m[0], m[2]);
    }
  }
}

function checkSvgs(src, report) {
  for (const m of src.matchAll(/<svg\b[^>]*>/g)) {
    const tag = m[0];
    const before = src.slice(0, m.index);
    const line = before.split("\n").length;
    // `<svg>` inside a string is text about an svg, not one.
    const lineSoFar = before.slice(before.lastIndexOf("\n") + 1);
    if ((lineSoFar.match(/["'`]/g) ?? []).length % 2) continue;
    const attr = (name) => tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|\\{\\s*([\\d.]+)\\s*\\}|\\{[^}]*\\})`));
    const w = attr("width");
    const h = attr("height");
    if (!w || !h) {
      // Sized by CSS to fill a container, or drawn on a large grid: a drawing,
      // not an icon.
      if (/\b(?:[wh]-full|size-full|inset-0)\b|100%|style=/.test(tag)) continue;
      const box = tag.match(/viewBox="[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/);
      if (box && Number(box[1]) > 32 && Number(box[2]) > 32) continue;
      report(line, "icon-size", "<svg> without width and height attributes");
      continue;
    }
    const wv = w[1] ?? w[2];
    const hv = h[1] ?? h[2];
    // Dynamic sizes, filter/defs holders (0) and anything larger than an icon
    // are not icons.
    const n = Number(wv);
    if (!/^[\d.]+$/.test(wv ?? "") || !/^[\d.]+$/.test(hv ?? "") || n === 0 || n > 32) continue;
    if (!ICON_SIZES.has(wv) || wv !== hv) report(line, "icon-size", `icon at ${wv}×${hv} — 16, 20 or 24, square`);
    const vb = tag.match(/viewBox="([^"]*)"/);
    if (vb && vb[1].trim().replace(/\s+/g, " ") !== "0 0 24 24") {
      report(line, "icon-grid", `viewBox="${vb[1]}" — icons are drawn on 0 0 24 24`);
    }
  }
}

function* walk(path) {
  const st = statSync(path, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isFile()) return yield path;
  for (const name of readdirSync(path)) {
    if (SKIP_DIRS.has(name)) continue;
    yield* walk(join(path, name));
  }
}

const args = process.argv.slice(2);
const listExempt = args.includes("--exempt");
const roots = args.filter((a) => !a.startsWith("--"));
const findings = [];
const exempt = [];

for (const root of roots.length ? roots : ["src"]) {
  for (const file of walk(root)) {
    const ext = extname(file);
    if (!MARKUP.has(ext) && !STYLE.has(ext) && !SCRIPT.has(ext)) continue;
    if (file.endsWith(".d.ts") || /\.(test|spec)\.\w+$/.test(file)) continue;
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    const reason = (n) => (lines[n - 1] ?? "").match(/kkrll-ignore:\s*(\S.*?)\s*(?:\*\/|-->|\}|$)/)?.[1];
    const report = (line, rule, text, hard = false) => {
      const why = reason(line);
      if (why && !hard) exempt.push({ file, line, rule, text, why });
      else findings.push({ file, line, rule, text: hard && why ? `${text}  (cannot be exempted)` : text });
    };

    lines.forEach((text, i) => {
      for (const rule of LINE_RULES) {
        if (!rule.files.some((set) => set.has(ext))) continue;
        if (rule.skip?.test(text)) continue;
        for (const m of text.matchAll(rule.re)) report(i + 1, rule.id, m[0].trim());
      }
      checkTracking(text, ext, (match, hard) => report(i + 1, "tracking", match, hard));
    });
    if (MARKUP.has(ext)) checkSvgs(src, report);
  }
}

for (const f of findings) console.log(`${f.file}:${f.line}  ${f.rule.padEnd(10)}  ${f.text}`);
if (listExempt) {
  for (const e of exempt) console.log(`${e.file}:${e.line}  exempt      ${e.rule}: ${e.why}`);
}
const exemptNote = exempt.length ? ` ${exempt.length} exempt${listExempt ? "" : " (--exempt to list)"}.` : "";
if (!findings.length && exemptNote) console.log(exemptNote.trim());
if (findings.length) {
  const byRule = Object.entries(Object.groupBy(findings, (f) => f.rule))
    .map(([rule, list]) => `${rule} ${list.length}`)
    .join(" · ");
  console.log(`\n${findings.length} found — ${byRule}.${exemptNote} Rules: design.md §0.`);
  process.exit(1);
}
