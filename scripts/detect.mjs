#!/usr/bin/env node
/*
 * avoid-ai-design · detect.mjs  (zero dependencies, Node 18+)
 *
 * Scans frontend source for the CODE-CERTAIN tells in references/ai-tells-catalog.md.
 * It does not judge the visual tells (palette weight, spacing rhythm, hierarchy, motion feel);
 * those need a render. A finding means "a default nobody chose", not "an AI made this".
 *
 *   node scripts/detect.mjs [path ...]      scan files or folders (default: current folder)
 *     --json                                machine-readable output
 *     --min=P0|P1|P2                        lowest severity to report (default P2)
 *     --include-examples                    also scan examples/, fixtures/, stories/ and files marked slop-example
 *     --rules                               print the rule table and exit
 *   node scripts/detect.mjs --hook          Claude Code PostToolUse hook (reads the hook JSON on stdin)
 *
 * Exit codes: 0 = no P0/P1 findings · 2 = at least one P0/P1 finding · 1 = error.
 * Keep a deliberate choice: add `avoid-ai-design-ignore: SD1` on (or just above) the line, or
 * `avoid-ai-design-ignore-file: SD1, SD4` anywhere in the file (no IDs = skip the whole file).
 */
import fs from "node:fs";
import path from "node:path";

const VERSION = "0.5.0";
const SEV = { P0: 0, P1: 1, P2: 2 };
const STACK = 6; // distinct tells in one file at which the page reads as a template
const EXT = new Set([".html", ".htm", ".css", ".scss", ".sass", ".less", ".js", ".jsx", ".ts", ".tsx",
  ".mjs", ".cjs", ".vue", ".svelte", ".astro", ".mdx", ".json"]);
const MARKUP = new Set([".html", ".htm", ".vue", ".svelte", ".astro"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit",
  ".output", "coverage", "vendor", ".turbo", ".vercel", ".cache"]);
const EXAMPLE_DIRS = new Set(["examples", "example", "fixtures", "__fixtures__", "__mocks__", "stories", ".storybook"]);

// ── color math ────────────────────────────────────────────────────────────────
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;
function parseColor(s) {
  s = s.trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const n = parseInt(h.slice(0, 6), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  return null;
}
function hsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: s * 100, l: l * 100 };
}
function luminance({ r, g, b }) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const inHue = (h, lo, hi) => (lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi);
const is = {
  cream: (c) => { const { h, s, l } = hsl(c); return l >= 89 && l < 99.5 && s >= 12 && inHue(h, 20, 60); },
  terracotta: (c) => { const { h, s, l } = hsl(c); return inHue(h, 355, 28) && s >= 45 && l >= 35 && l <= 68; },
  nearBlack: (c) => hsl(c).l <= 9,
  acidGreen: (c) => { const { h, s, l } = hsl(c); return inHue(h, 70, 160) && s >= 55 && l >= 38 && l <= 72; },
  vermilion: (c) => { const { h, s, l } = hsl(c); return inHue(h, 355, 18) && s >= 60 && l >= 40 && l <= 65; },
  violet: (c) => { const { h, s, l } = hsl(c); return inHue(h, 228, 300) && s >= 40 && l > 15 && l < 90; },
  saturated: (c) => { const { s, l } = hsl(c); return s >= 45 && l >= 20 && l <= 80; },
  // the palettes OpenAI's GPT-5.5 frontend guide names as defaults (SD9)
  slate: (c) => { const { h, s, l } = hsl(c); return inHue(h, 195, 245) && s >= 15 && l <= 24; },
  espresso: (c) => { const { h, s, l } = hsl(c); return inHue(h, 10, 45) && s >= 12 && l <= 22; },
  sand: (c) => { const { h, s, l } = hsl(c); return inHue(h, 20, 60) && s >= 12 && l >= 72 && l < 99.5; },
  orange: (c) => { const { h, s, l } = hsl(c); return inHue(h, 12, 42) && s >= 60 && l >= 40 && l <= 65; },
  chromatic: (c) => { const { s, l } = hsl(c); return s >= 12 && l >= 6 && l <= 97; },
};
const TW_HEX = { "zinc-950": "#09090b", "neutral-950": "#0a0a0a", "stone-950": "#0c0a09", "gray-950": "#030712",
  "slate-950": "#020617", black: "#000000", "amber-50": "#fffbeb", "orange-50": "#fff7ed", "yellow-50": "#fefce8",
  "slate-900": "#0f172a", "stone-900": "#1c1917", "stone-100": "#f5f5f4", "stone-200": "#e7e5e4", "amber-100": "#fef3c7" };

// ── helpers ───────────────────────────────────────────────────────────────────
function lineStarts(text) { const s = [0]; for (let i = 0; i < text.length; i++) if (text[i] === "\n") s.push(i + 1); return s; }
function lineAt(starts, idx) { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; } return lo + 1; }
function* matches(text, re) { const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"); let m; while ((m = g.exec(text))) { yield m; if (m[0] === "") g.lastIndex++; } }
const count = (text, re) => { let n = 0; for (const _ of matches(text, re)) n++; return n; };

function buildContext(file, rel, text) {
  const ext = path.extname(file).toLowerCase();
  const starts = lineStarts(text);
  const isMarkup = MARKUP.has(ext);
  // CSS regions: whole file for stylesheets, <style> blocks for markup, whole text for JS (css-in-js).
  const cssBlocks = [];
  if ([".css", ".scss", ".sass", ".less"].includes(ext)) cssBlocks.push({ css: text, base: 0 });
  else for (const m of matches(text, /<style\b[^>]*>([\s\S]*?)<\/style>/i)) cssBlocks.push({ css: m[1], base: m.index + m[0].indexOf(m[1]) });
  const rules = [];
  for (const block of cssBlocks) {
    // blank out comments (length-preserving) so they never leak into selectors or shift line numbers
    const css = block.css.replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, " ")), base = block.base;
    for (const m of matches(css, /([^{}]+)\{([^{}]*)\}/))
      rules.push({ sel: m[1].trim(), body: m[2], idx: base + m.index + (m[1].length - m[1].trimStart().length) });
  }
  const vars = {};
  for (const r of rules) for (const m of matches(r.body, /--([\w-]+)\s*:\s*([^;]+)/)) vars[m[1]] = m[2].trim();
  const resolve = (v, depth = 0) => depth > 6 ? v : v.replace(/var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_, n, fb) => (vars[n] !== undefined ? resolve(vars[n], depth + 1) : fb || ""));
  const colorsIn = (v) => [...resolve(v).matchAll(COLOR_RE)].map((m) => parseColor(m[0])).filter(Boolean);
  // page background: body/html/:root rule, else a Tailwind bg class on <body>/<html>
  let pageBg = null;
  for (const r of rules) {
    if (!r.sel.split(",").some((s) => /^(html|body|:root)$/.test(s.trim()))) continue;
    const m = r.body.match(/background(?:-color)?\s*:\s*([^;]+)/);
    if (m) { const cs = colorsIn(m[1]); if (cs.length) pageBg = cs[cs.length - 1]; }
  }
  if (!pageBg) {
    const m = text.match(/<(?:body|html)\b[^>]*class(?:Name)?=["'][^"']*\bbg-(\[#[0-9a-fA-F]{3,8}\]|[a-z]+(?:-\d{2,3})?)/);
    if (m) pageBg = parseColor(m[1].startsWith("[") ? m[1].slice(1, -1) : TW_HEX[m[1]] || "");
  }
  const classAttrs = [...matches(text, /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\})/)].map((m) => ({ cls: m[1] ?? m[2] ?? m[3] ?? "", idx: m.index }));
  const allColors = [...matches(resolve(text), COLOR_RE)].map((m) => parseColor(m[0])).filter(Boolean);
  const visible = text.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, (s) => s.replace(/[^\n]/g, " "));
  return { file, rel, ext, text, visible, starts, isMarkup, rules, vars, resolve, colorsIn, pageBg, classAttrs, allColors,
    line: (i) => lineAt(starts, i) };
}

// ── rules ─────────────────────────────────────────────────────────────────────
// Each rule returns an array of hit indices (or {idx, note}). Hits are aggregated per file.
const at = (ctx, arr) => arr.map((x) => (typeof x === "number" ? { idx: x } : x));
const idxOf = (re) => (ctx) => at(ctx, [...matches(ctx.text, re)].map((m) => m.index));
const clsHits = (ctx, test) => ctx.classAttrs.filter((c) => test(c.cls)).map((c) => ({ idx: c.idx }));
const T1_SET = new Set(["inter", "roboto", "arial", "open sans", "system-ui", "-apple-system", "blinkmacsystemfont", "segoe ui", "ui-sans-serif", "sans-serif"]);
const TASTEFUL = /\b(space grotesk|geist(?! mono)|syne|sora|instrument serif|fraunces|cal sans)\b/i;
const MONO = /mono|menlo|consolas|courier|monaco|jetbrains|fira code|ibm plex mono/i;
// Faces a browser can render without loading anything (OS-installed or generic families).
const SYSTEM_FACES = /^(inherit|initial|unset|serif|sans-serif|monospace|cursive|fantasy|math|emoji|system-ui|-apple-system|blinkmacsystemfont|ui-(?:serif|sans-serif|monospace|rounded)|helvetica(?: neue)?|arial|georgia|times(?: new roman)?|verdana|tahoma|trebuchet ms|courier(?: new)?|sf (?:mono|pro[\w ]*)|menlo|monaco|consolas|segoe ui|roboto|iowan old style|charter|palatino(?: linotype)?|avenir(?: next)?|futura|gill sans|optima|baskerville|didot|hoefler text|lucida grande|liberation (?:mono|sans|serif)|cascadia (?:code|mono)|noto (?:sans|serif)[\w ]*|apple color emoji|segoe ui emoji)$/;
const EFFECTS = /\b(Spotlight|BackgroundBeams|BackgroundBeamsWithCollision|AnimatedBeam|ShimmerButton|NumberTicker|BorderBeam|Meteors|Marquee|SparklesCore|LampContainer|CardContainer|CardBody|AuroraBackground|DotPattern|GridPattern|RetroGrid|Particles|OrbitingCircles|TextGenerateEffect|TypewriterEffect|HeroHighlight|WavyBackground|InfiniteMovingCards|BentoGrid|MagicCard|NeonGradientCard|ShineBorder|AnimatedGradientText|RainbowButton|FlipWords|HoverBorderGradient|MovingBorder|GlowingEffect)\b/;
const HEADLINE_FLUFF = /\b(elevate your|build the future|all-in-one (?:platform|solution|workspace)|scale without limits|unleash the power|revolutioni[sz]e (?:your|the way)|transform (?:your|the way)|supercharge your|reimagine (?:your|how)|next-generation|the future of \w+ is here)\b/i;
const SUPERLATIVES = /\b(seamless(?:ly)?|cutting-edge|best-in-class|world-class|powerful|robust|effortless(?:ly)?|game-?changing|next-level|state-of-the-art|revolutionary|blazing(?:ly)?[- ]fast)\b/gi;

function cssRuleHits(ctx, pred) { return ctx.rules.filter(pred).map((r) => ({ idx: r.idx + (r.sel.length ? 0 : 0) })); }

const RULES = [
  // ── Second-order defaults (the "tasteful AI" clusters; Anthropic frontend-design) ──
  { id: "SD1", sev: "P1", name: "Cream ground + terracotta/clay accent (the Claude look)",
    why: "The warm-cream + terracotta cluster (#F4F1EA / #D97757 territory) is what models reach for to look tasteful.",
    run(ctx) {
      const tw = ctx.classAttrs.some((c) => /\bbg-(amber|orange|yellow)-50\b|\bbg-\[#f[0-9a-f]{5}\]/i.test(c.cls)) &&
        ctx.classAttrs.some((c) => /\b(text|bg)-(orange|amber)-(6|7)00\b|\[#(d97757|c96442|cc785c)\]/i.test(c.cls));
      const css = ctx.pageBg && is.cream(ctx.pageBg) && ctx.allColors.some(is.terracotta);
      if (!tw && !css) return [];
      const m = ctx.text.search(/#d97757|#f4f1ea|terracotta|clay/i);
      return [{ idx: Math.max(0, m), note: css ? `page ground ${fmt(ctx.pageBg)} + a terracotta/clay accent` : "Tailwind cream + orange/amber accent" }];
    } },
  { id: "SD2", sev: "P1", name: "Near-black ground + one acid-green or vermilion accent",
    why: "Near-black with a single bright acid-green or vermilion signal is the second 'tasteful default' cluster.",
    run(ctx) {
      const tw = ctx.classAttrs.some((c) => /\bbg-(black|zinc-950|neutral-950|stone-950|gray-950|slate-950)\b/.test(c.cls)) &&
        ctx.classAttrs.some((c) => /\b(text|bg|border)-(lime|green|emerald)-(300|400|500)\b/.test(c.cls));
      const css = ctx.pageBg && is.nearBlack(ctx.pageBg) && ctx.allColors.some((c) => is.acidGreen(c) || is.vermilion(c));
      return tw || css ? [{ idx: 0, note: css ? `page ground ${fmt(ctx.pageBg)} + an acid-green/vermilion signal` : "Tailwind near-black + lime/green accent" }] : [];
    } },
  { id: "SD4", sev: "P1", name: "Template chrome: tracked ALL-CAPS labels",
    why: "An uppercase, letter-spaced label on everything is chrome that appears whatever the subject.",
    run(ctx) {
      const css = ctx.rules.filter((r) => /text-transform\s*:\s*uppercase/.test(r.body) && /letter-spacing\s*:\s*\.?\d/.test(r.body)).map((r) => ({ idx: r.idx }));
      const tw = clsHits(ctx, (c) => /\buppercase\b/.test(c) && /\btracking-(wide|wider|widest|\[)/.test(c));
      const hits = [...css, ...tw];
      return hits.length >= 3 ? hits : [];
    } },
  { id: "SD4m", sev: "P2", name: "Template chrome: monospace as small data labels",
    why: "A mono face for tiny labels and readouts is decoration standing in for information design.",
    run(ctx) {
      const css = ctx.rules.filter((r) => {
        const ff = r.body.match(/font-family\s*:\s*([^;]+)/); const fs = r.body.match(/font-size\s*:\s*([\d.]+)(px|rem|em)/);
        if (!ff || !fs || !MONO.test(ctx.resolve(ff[1]))) return false;
        const px = fs[2] === "px" ? +fs[1] : +fs[1] * 16; return px <= 12.5;
      }).map((r) => ({ idx: r.idx }));
      const tw = clsHits(ctx, (c) => /\bfont-mono\b/.test(c) && /\btext-(xs|\[1[0-2]px\]|\[\d\.?\d*rem\])/.test(c));
      const hits = [...css, ...tw];
      return hits.length >= 3 ? hits : [];
    } },
  { id: "SD4d", sev: "P2", name: "Template chrome: meta strings joined with middle dots",
    why: "'A · B · C' metadata strings are a stock chrome move, not a decision about this content.",
    run(ctx) { const h = [...matches(ctx.visible, /[^\s<>{}·][^<>{}\n·]{0,40}\s·\s[^<>{}\n]{1,60}/)].map((m) => ({ idx: m.index })); return h.length >= 2 ? h : []; } },
  { id: "SD4w", sev: "P2", name: "Template chrome: 'WORD — fragment' labels",
    why: "Labels built as an uppercase word + spaced em dash + fragment are a recurring generated pattern.",
    run: (ctx) => at(ctx, [...matches(ctx.visible, /\b[A-Z][A-Z0-9]{2,}(?:\s[A-Z0-9]{2,})*\s[—–]\s[A-Za-z]/)].map((m) => m.index)) },
  { id: "SD5", sev: "P1", name: "One word accented in the headline",
    why: "Coloring, italicizing, or highlighting a single headline word is among the commonest tells of a generated page.",
    run(ctx) {
      const out = [];
      for (const m of matches(ctx.text, /<h([12])\b[^>]*>([\s\S]{0,600}?)<\/h\1>/i)) {
        const inner = m[2];
        const acc = inner.match(/<(span|em|i|b|strong|mark)\b([^>]*)>([\s\S]{1,60}?)<\/\1>/i);
        if (!acc) continue;
        const words = acc[3].replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length;
        const all = inner.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
        if (words >= 1 && words <= 3 && all > words) out.push({ idx: m.index, note: `"${acc[3].replace(/<[^>]+>/g, "").trim()}"${/^(em|i)$/i.test(acc[1]) || /italic/.test(acc[2]) ? " (italic: see T3)" : ""}` });
      }
      return out;
    } },
  { id: "SD6", sev: "P1", name: "Decorative 01 / 02 / 03 markers",
    why: "Two-digit numerals are only information when the content is a real sequence; otherwise they are decoration.",
    run(ctx) { const h = [...matches(ctx.visible, />\s*[\/\[(#]?\s*0[1-9]\s*[\])]?\s*</)].map((m) => ({ idx: m.index })); return h.length >= 3 ? h : []; } },
  { id: "SD7", sev: "P2", name: "Fake window chrome (three traffic-light dots)",
    why: "A code or product window wearing macOS dots is the stock 'product shot' of generated heroes.",
    run(ctx) {
      // three empty <i>/<span> as the first children of a bar-like element (a title bar), not skeleton rows or chart bars
      const dots = [...matches(ctx.text, /class(?:Name)?=["'][^"']*\b(?:bar|titlebar|title-bar|chrome|window|dots|traffic|toolbar|topbar)\b[^"']*["'][^>]*>\s*(?:<(i|span)\b(?![^>]*style)[^>]*>\s*<\/\1>\s*){3}/)].map((m) => ({ idx: m.index }));
      const mac = [...matches(ctx.text, /#(ff5f57|febc2e|ffbd2e|28c840|27c93f)\b/i)].map((m) => ({ idx: m.index }));
      return [...dots, ...mac];
    } },
  { id: "SD8", sev: "P2", name: "Emerald as the purple-avoiding accent",
    why: "When purple is ruled out, emerald is the model's next reflex; it is still a default unless the brief earns it.",
    run: (ctx) => [...idxOf(/#(10b981|059669|34d399|6ee7b7|047857)\b/i)(ctx), ...clsHits(ctx, (c) => /\b(bg|text|from|to|border|ring)-emerald-\d{3}\b/.test(c))] },
  { id: "SD9", sev: "P1", name: "A palette the vendors now name as a default",
    why: "OpenAI's GPT-5.5 frontend guide lists dark blue/slate, brown/espresso with orange, and beige/sand/cream grounds as the palettes models fall back on.",
    run(ctx) {
      const bg = ctx.pageBg;
      const twBg = (re) => ctx.classAttrs.some((c) => /<(?:body|html|main)\b/.test(ctx.text.slice(Math.max(0, c.idx - 60), c.idx)) && re.test(c.cls));
      let note = null;
      if ((bg && is.slate(bg)) || twBg(/\bbg-(slate|blue|sky)-(900|950)\b|\bbg-\[#0f172a\]/)) note = "dark blue / slate ground";
      else if ((bg && is.espresso(bg) && ctx.allColors.some(is.orange)) || (twBg(/\bbg-(stone|amber|orange)-(900|950)\b/) && ctx.classAttrs.some((c) => /\b(text|bg)-(orange|amber)-(400|500|600)\b/.test(c.cls)))) note = "espresso ground + orange accent";
      else if (bg && is.sand(bg) && !(is.cream(bg) && ctx.allColors.some(is.terracotta))) note = "beige / sand / cream ground";
      else if (twBg(/\bbg-(amber|orange|yellow)-(50|100)\b/) && !ctx.classAttrs.some((c) => /\b(text|bg)-(orange|amber)-(6|7)00\b/.test(c.cls))) note = "beige / sand / cream ground";
      return note ? [{ idx: Math.max(0, ctx.text.search(/<body\b|background/)), note: bg ? `${note} (${fmt(bg)})` : note }] : [];
    } },

  // ── Typography ──
  { id: "T1", sev: "P0", name: "Inter as the primary face",
    why: "Inter is the default of nearly every AI tool and component library.",
    run(ctx) {
      const out = [];
      for (const m of matches(ctx.text, /font-family\s*:\s*([^;}{"]+|"[^"]*"[^;}{]*)/i)) {
        const first = ctx.resolve(m[1]).split(",")[0].replace(/["']/g, "").trim().toLowerCase();
        if (first === "inter") out.push({ idx: m.index });
      }
      for (const m of matches(ctx.text, /\bInter\s*\(\s*\{|fonts\.googleapis\.com\/css2?\?family=Inter\b|sans\s*:\s*\[\s*["']Inter/)) out.push({ idx: m.index });
      return out;
    } },
  { id: "T2", sev: "P1", name: "A face from the 'tasteful free font' cluster",
    why: "Space Grotesk, Geist, Syne, Sora, Instrument Serif, Fraunces, Cal Sans: the non-generic choices that became generic.",
    run: (ctx) => [...matches(ctx.text, /(?:font-family\s*:[^;}{]*|family=|next\/font[^\n]*|fontFamily[^\n]*)(space grotesk|space_grotesk|geist(?![\s_-]?mono)|syne|sora|instrument[\s_+]serif|fraunces|cal[\s_+]sans)/i)]
      .map((m) => ({ idx: m.index, note: m[1].replace(/[_+]/g, " ") })) },
  { id: "T7", sev: "P1", name: "Typeface declared but never shipped",
    why: "The CSS names a face the page never loads, so every visitor sees the fallback. Declaring is not shipping.",
    scope: "page",
    run(ctx) {
      const loaded = [...ctx.text.matchAll(/@font-face\s*\{[^}]*font-family\s*:\s*["']?([^"';}]+)/gi)].map((m) => m[1].trim().toLowerCase())
        .concat([...ctx.text.matchAll(/family=([^&"':]+)/gi)].map((m) => decodeURIComponent(m[1]).replace(/\+/g, " ").trim().toLowerCase()));
      const out = [];
      for (const m of matches(ctx.text, /font-family\s*:\s*([^;}{]+)/i)) {
        const first = ctx.resolve(m[1]).split(",")[0].replace(/["']/g, "").trim();
        const key = first.toLowerCase();
        if (!first || /^var\(/.test(first) || SYSTEM_FACES.test(key) || loaded.some((l) => l === key || key.startsWith(l))) continue;
        out.push({ idx: m.index, note: first });
      }
      return out;
    } },
  { id: "T4", sev: "P1", name: "Geist left untouched",
    why: "Geist is the Next.js default; shipping it unpaired says the starter was never themed.",
    run: idxOf(/from\s+["']geist\/font|\bGeistSans\b|\bGeist\s*\(\s*\{/) },

  // ── Color ──
  { id: "C1", sev: "P0", name: "Purple / indigo gradient",
    why: "The canonical unchosen gradient (the Tailwind indigo-500 lineage).",
    run(ctx) {
      const out = [];
      for (const m of matches(ctx.text, /(?:linear|radial|conic)-gradient\(([^;{}]*)\)/i))
        if (ctx.colorsIn(m[1]).some(is.violet)) out.push({ idx: m.index });
      for (const c of ctx.classAttrs)
        if (/\b(from|via|to)-(indigo|violet|purple|fuchsia)-\d{2,3}\b/.test(c.cls) && /\bbg-(gradient|linear|radial)/.test(c.cls)) out.push({ idx: c.idx });
      return out;
    } },
  { id: "C2", sev: "P1", name: "Indigo / violet primary buttons",
    why: "The accent defaulted instead of being chosen.",
    run: (ctx) => [...clsHits(ctx, (c) => /\bbg-(indigo|violet|purple)-[4-7]00(?![\/\w-])/.test(c)),
      ...ctx.rules.filter((r) => /btn|button/i.test(r.sel) && /background/.test(r.body) && ctx.colorsIn(r.body).some(is.violet))
        .map((r) => { const c = ctx.colorsIn(r.body).find(is.violet); return { idx: r.idx, note: `${fmt(c)} (hue ${Math.round(hsl(c).h)}°)` }; })] },
  { id: "C5", sev: "P2", name: "Colored glow shadows",
    why: "A saturated shadow is decoration that says nothing about elevation.",
    run(ctx) {
      const out = [];
      for (const m of matches(ctx.text, /box-shadow\s*:\s*([^;}{]+)/i)) {
        // a glow is an outer shadow with real blur (≥ 8px); inset underlines and hairline rings are not
        const blur = m[1].match(/^\s*-?[\d.]+(?:px)?\s+-?[\d.]+(?:px)?\s+([\d.]+)px/);
        if (/\binset\b/.test(m[1]) || !blur || +blur[1] < 8) continue;
        if (ctx.colorsIn(m[1]).some((c) => c.a >= 0.25 && is.saturated(c))) out.push({ idx: m.index });
      }
      return [...out, ...clsHits(ctx, (c) => /\bshadow-(indigo|violet|purple|pink|fuchsia|blue|sky|cyan|emerald|teal)-\d{3}/.test(c))];
    } },
  { id: "C6", sev: "P0", name: "Gradient-filled headline text",
    why: "bg-clip-text gradients are a 2024-era default flourish that also hurts legibility.",
    run: (ctx) => [...ctx.rules.filter((r) => /background-clip\s*:\s*text/.test(r.body) && /(color|text-fill-color)\s*:\s*transparent/.test(r.body)).map((r) => ({ idx: r.idx })),
      ...clsHits(ctx, (c) => /\bbg-clip-text\b/.test(c) && /\btext-transparent\b/.test(c))] },
  { id: "C8", sev: "P2", name: "One hue pretending to be two",
    why: "A primary and an accent less than 20° apart are one color; the palette has no second job.",
    run(ctx) {
      const pick = (re) => Object.entries(ctx.vars).filter(([k]) => re.test(k)).map(([, v]) => ctx.colorsIn(v)[0]).find((c) => c && is.saturated(c));
      const p = pick(/^(primary|brand)$/), a = pick(/^(accent|secondary|highlight|signal)$/);
      if (!p || !a) return [];
      const d = Math.abs(hsl(p).h - hsl(a).h); return Math.min(d, 360 - d) < 20 ? [{ idx: 0, note: `${fmt(p)} vs ${fmt(a)}` }] : [];
    } },
  { id: "C9", sev: "P1", name: "Muted text below WCAG AA",
    why: "Grey-on-grey body copy fails contrast; it is both a tell and an accessibility defect.",
    run(ctx) {
      if (!ctx.pageBg) return [];
      const out = [];
      for (const [k, v] of Object.entries(ctx.vars)) {
        if (!/^(mut|muted|muted-foreground|text-muted|subtle|fg-muted|secondary-foreground)$/.test(k)) continue;
        const c = ctx.colorsIn(v)[0]; if (!c || c.a < 1) continue;
        const r = contrast(c, ctx.pageBg); if (r < 4.5) out.push({ idx: ctx.text.indexOf(`--${k}`), note: `--${k} ${fmt(c)} on ${fmt(ctx.pageBg)} = ${r.toFixed(2)}:1` });
      }
      return out;
    } },
  { id: "C10", sev: "P1", name: "One-note palette",
    why: "Ground, ink, and accents all drawn from one hue family: a palette that never chose a second color.",
    run(ctx) {
      if (!ctx.pageBg) return [];
      // every tinted color the stylesheet declares, deduplicated
      const seen = new Map();
      for (const r of ctx.rules) for (const c of ctx.colorsIn(r.body)) if (c.a >= 0.5 && is.chromatic(c)) seen.set(fmt(c), c);
      const cs = [...seen.values()];
      if (cs.length < 5 || !is.chromatic(ctx.pageBg)) return [];
      const hues = cs.map((c) => hsl(c).h).concat(hsl(ctx.pageBg).h).sort((a, b) => a - b);
      // circular spread: 360 minus the largest gap between neighbouring hues
      let gap = 360 - hues[hues.length - 1] + hues[0];
      for (let i = 1; i < hues.length; i++) gap = Math.max(gap, hues[i] - hues[i - 1]);
      const spread = 360 - gap;
      return spread <= 30 ? [{ idx: Math.max(0, ctx.text.search(/:root|<style/)), note: `${cs.length} tinted colors within ${Math.round(spread)}° of hue, ground included` }] : [];
    } },
  { id: "C11", sev: "P1", name: "Decorative orbs, bokeh, and glow blobs",
    why: "Blurred circles floating behind the hero or an input are atmosphere with no subject; OpenAI's guide bans them by name.",
    run(ctx) {
      const css = ctx.rules.filter((r) => /border-radius\s*:\s*(50%|9{3,}px|100%)/.test(r.body) && /filter\s*:\s*blur\(\s*(\d+)/.test(r.body) && +r.body.match(/filter\s*:\s*blur\(\s*(\d+)/)[1] >= 24)
        .map((r) => ({ idx: r.idx }));
      const tw = clsHits(ctx, (c) => /\brounded-full\b/.test(c) && /\bblur-(2xl|3xl|\[\d{2,}px\])/.test(c) && /\b(absolute|fixed|-z-10)\b/.test(c));
      const named = clsHits(ctx, (c) => /(^|\s)(orb|blob|bokeh|glow-blob|gradient-orb)s?(\s|$|-)/.test(c));
      return [...css, ...tw, ...named];
    } },

  // ── Layout ──
  { id: "L1", sev: "P0", name: "Pill badge + centered hero",
    why: "Badge, centered H1, centered subhead, two centered CTAs: the landing-page skeleton that makes no spatial decision.",
    run(ctx) {
      const centered = ctx.rules.some((r) => /hero|header|banner/i.test(r.sel) && /text-align\s*:\s*center/.test(r.body));
      return [...matches(ctx.text, /<h1\b/i)].filter((m) => {
        const before = ctx.text.slice(Math.max(0, m.index - 900), m.index);
        return /(class(Name)?=["'][^"']*\b(pill|badge|chip)\b|rounded-full)/.test(before) && (centered || /\btext-center\b/.test(before));
      }).map((m) => ({ idx: m.index }));
    } },
  { id: "L2", sev: "P0", name: "Three identical icon-topped feature cards",
    why: "The most clichéd SaaS pattern: equal cards, each with an icon chip, a title, a line of text.",
    run(ctx) {
      const grid3 = /repeat\(\s*3\s*,\s*1fr\s*\)|\bgrid-cols-3\b|\bmd:grid-cols-3\b|\blg:grid-cols-3\b/.test(ctx.text);
      return grid3 && iconChips(ctx).length >= 3 ? [iconChips(ctx)[0]] : [];
    } },
  { id: "L4", sev: "P1", name: "Round-number stat strip",
    why: "'12,000+ · 99.9% · 4.9★' reads as placeholder proof; one specific, true metric beats four invented ones.",
    run(ctx) {
      const inline = "(?:b|strong|span|em|i|small|sup)";
      const re = new RegExp(`>\\s*\\d[\\d.,]*\\s*(?:<${inline}\\b[^>]*>\\s*)?(?:\\+|%|★|[KMB]\\+?)\\s*(?:<\\/${inline}>\\s*)?<`);
      const h = [];
      for (const m of matches(ctx.visible, re)) {
        // numbers inside table cells are data, not a proof strip
        const open = ctx.visible.lastIndexOf("<", m.index);
        if (/^<t[dh]\b/i.test(ctx.visible.slice(open, open + 4))) continue;
        h.push({ idx: m.index });
      }
      return h.length >= 3 ? [h[0]] : [];
    } },
  { id: "L6", sev: "P1", name: "The default page shell",
    why: "One centered width for every section is a reflex, not a spatial decision.",
    run(ctx) { const h = clsHits(ctx, (c) => /\bcontainer\b[^"']*\bmx-auto\b|\bmx-auto\b[^"']*\bcontainer\b|\bmax-w-7xl\b[^"']*\bmx-auto\b|\bmx-auto\b[^"']*\bmax-w-7xl\b/.test(c)); return h.length >= 3 ? h : []; } },
  { id: "L7", sev: "P1", name: "Three tiers with a 'Most Popular' ring",
    why: "The stock pricing template, shipped regardless of the actual offer.",
    run: (ctx) => /scale\(1\.0?5\)|scale-105|\bring-2\b|border\s*:\s*2px/.test(ctx.text) ? [...matches(ctx.visible, /most popular/i)].map((m) => ({ idx: m.index })) : [] },
  { id: "L8", sev: "P1", name: "The default four-column footer",
    why: "Four link columns + a newsletter box + a social row: the universal generated footer.",
    run: (ctx) => [...matches(ctx.text, /<footer\b[\s\S]*?<\/footer>/i)].filter((m) => count(m[0], /<h[3-6]\b/i) >= 4 && /<input\b/i.test(m[0])).map((m) => ({ idx: m.index })) },
  { id: "L9", sev: "P1", name: "The cookie-cutter section order",
    why: "Hero → logos → features → stats → pricing → CTA → footer, whatever the product. Confirm with the silhouette test.",
    run(ctx) {
      const t = ctx.visible;
      const parts = [/<h1\b/i, /trusted by|used by|loved by|teams at/i, /features|everything you need/i, /how it works/i,
        /testimonial|what (?:our )?(?:customers|users) say/i, /\/\s*mo\b|per month|pricing/i, /\bfaq\b|frequently asked/i,
        /ready to (?:get started|start|try)|start (?:your )?free/i, /<footer\b/i].filter((re) => re.test(t)).length;
      return parts >= 6 ? [{ idx: 0, note: `${parts} of the 9 stock sections present` }] : [];
    } },
  { id: "L10", sev: "P2", name: "Faint grid or dot pattern behind the hero",
    why: "A 1px grid or dot field, usually masked to fade out, is the stock 'technical' backdrop of generated heroes.",
    run: (ctx) => [...idxOf(/(?:linear|radial)-gradient\((?:[^;{}()]|\([^()]*\))*?[\s_,]1px\s*,\s*transparent[\s_]+1px/i)(ctx),
      ...clsHits(ctx, (c) => /\bbg-(grid|dot|dots|grid-pattern|dot-pattern)(-[\w/]+)?\b/.test(c))] },
  { id: "L11", sev: "P1", name: "A big number as the hero",
    why: "Anthropic names it: 'a big number with a small label, supporting stats, and a gradient accent' is the default hero.",
    run(ctx) {
      const t = ctx.visible, h2 = t.search(/<h2\b/i), end = h2 > 0 ? h2 : Math.floor(t.length * 0.4);
      const big = new Set();
      for (const r of ctx.rules) {
        const fs_ = r.body.match(/font-size\s*:\s*([^;]+)/); if (!fs_) continue;
        const sizes = [...fs_[1].matchAll(/([\d.]+)(px|rem|em)\b/g)].map((m) => (m[2] === "px" ? +m[1] : +m[1] * 16));
        if (!sizes.length || Math.max(...sizes) < 56) continue;
        const last = r.sel.split(/[\s>+~,]/).filter(Boolean).pop() || ""; const m = last.match(/^\.([\w-]+)$/); if (m) big.add(m[1]);
      }
      const out = [];
      for (const m of matches(t.slice(0, end), /<(\w+)\b[^>]*class(?:Name)?=["']([^"']*)["'][^>]*>\s*[$€£]?\d[\d.,]*\s*(?:%|×|x|\+|[KMB]\+?)?\s*<\/\1>/)) {
        const cls = m[2].split(/\s+/);
        if (cls.some((n) => big.has(n)) || /\btext-([6-9]xl|\[(?:[5-9]\d|\d{3})px\])/.test(m[2])) out.push({ idx: m.index });
      }
      return out;
    } },

  // ── Components ──
  { id: "K1", sev: "P0", name: "Untouched shadcn/ui base theme",
    why: "The starter was deployed without theming.",
    run: idxOf(/--primary\s*:\s*(?:oklch\(0\.205 0 0\)|222\.2 47\.4% 11\.2%|240 5\.9% 10%|0 0% 9%)|"baseColor"\s*:\s*"(?:zinc|slate|neutral|gray|stone)"/) },
  { id: "K8", sev: "P1", name: "Default --radius",
    why: "shadcn's stock radius left as-is is a fingerprint of an untouched theme.",
    run: idxOf(/--radius\s*:\s*0\.(?:5|625)rem/) },
  { id: "K2", sev: "P1", name: "One radius + soft shadow on every surface",
    why: "Identical radius and shadow everywhere flattens hierarchy into a template.",
    run(ctx) {
      const css = ctx.rules.filter((r) => { const m = r.body.match(/border-radius\s*:\s*(\d+)px/); return m && +m[1] >= 12 && +m[1] <= 28 && /box-shadow\s*:(?![^;]*\binset\b)/.test(r.body); }).map((r) => ({ idx: r.idx }));
      const tw = clsHits(ctx, (c) => /\brounded-(2xl|3xl|xl)\b/.test(c) && /\bshadow-(md|lg|xl|2xl)\b/.test(c));
      const h = [...css, ...tw]; return h.length >= 3 ? h : [];
    } },
  { id: "K3", sev: "P1", name: "Glassmorphism (backdrop-blur)",
    why: "Frosted surfaces by reflex; keep blur only where layering is real, like a nav over scrolling content.",
    run: (ctx) => [...idxOf(/backdrop-filter\s*:\s*blur/i)(ctx), ...clsHits(ctx, (c) => /\bbackdrop-blur/.test(c))] },
  { id: "K4", sev: "P1", name: "Colored side-stripe on cards",
    why: "Colored left/top borders are almost as reliable an AI tell as em dashes are in text.",
    run(ctx) {
      const css = [...matches(ctx.text, /border-(left|top)\s*:\s*([2-9]|\d{2})px\s+solid\s+([^;}{]+)/i)].filter((m) => ctx.colorsIn(m[3]).some(is.saturated)).map((m) => ({ idx: m.index }));
      const tw = clsHits(ctx, (c) => /\bborder-[lt]-(2|4|8)\b/.test(c) && /\bborder-(?:[lt]-)?(indigo|violet|purple|blue|sky|emerald|green|amber|orange|rose|red|pink|teal|cyan)-\d{3}/.test(c));
      return [...css, ...tw];
    } },
  { id: "K5", sev: "P2", name: "Sparkle pill above the title",
    why: "'✨ New' capsules announce nothing unless they carry real, dated news.",
    run: (ctx) => [...matches(ctx.text, /<h1\b/i)].filter((m) => /✨|✦|powered by ai|\bnew\b[:!]/i.test(ctx.text.slice(Math.max(0, m.index - 500), m.index))).map((m) => ({ idx: m.index })) },
  { id: "K6", sev: "P1", name: "Icon in a tinted rounded square",
    why: "The stock 'feature icon' treatment, one chip per card.",
    run: (ctx) => { const h = iconChips(ctx); return h.length >= 2 ? h : []; } },
  { id: "K9", sev: "P1", name: "The default dark SaaS card",
    why: "zinc-950 surfaces with white/10 hairlines: the unmodified 'modern dark' card.",
    run: (ctx) => clsHits(ctx, (c) => /\bbg-(zinc|gray|slate|neutral)-9(00|50)\b/.test(c) && /\bborder-white\/(5|10)\b/.test(c)) },
  { id: "K10", sev: "P1", name: "Stock effect-library components (Aceternity / Magic UI)",
    why: "Spotlights, animated beams, shimmer buttons, 3D tilt cards: the same effects across dozens of launches.",
    run: (ctx) => [...matches(ctx.text, new RegExp(`<${EFFECTS.source.replace(/^\\b/, "")}|components\\/(?:magicui|aceternity|ui\\/(?:spotlight|background-beams|animated-beam|shimmer-button|number-ticker|border-beam|meteors|marquee|sparkles|lamp|3d-card|aurora-background))`))]
      .map((m) => ({ idx: m.index, note: (m[1] || m[0]).replace(/^</, "") })) },
  { id: "K13", sev: "P2", name: "Pulsing status dot",
    why: "A pinging green dot beside 'Live' or 'Now in beta' signals activity the page does not have.",
    run: (ctx) => [...clsHits(ctx, (c) => /\banimate-ping\b/.test(c) || (/\banimate-pulse\b/.test(c) && /\brounded-full\b/.test(c) && /\b(h|w|size)-(1\.5|2|2\.5|3)\b/.test(c))),
      ...ctx.rules.filter((r) => /dot|pulse|live|status|indicator|beacon/i.test(r.sel) && /border-radius\s*:\s*(50%|9{3,}px)/.test(r.body) && /animation\s*:[^;]*infinite/.test(r.body)).map((r) => ({ idx: r.idx }))] },
  { id: "K14", sev: "P2", name: "Check marks in tinted circles",
    why: "A check icon inside a soft colored circle on every list line is the stock feature and pricing list.",
    run(ctx) {
      const h = [];
      for (const c of ctx.classAttrs) {
        const circle = (/\brounded-full\b/.test(c.cls) && /\bbg-[a-z]+-(50|100|\d{3}\/(5|10|15|20))\b/.test(c.cls)) ||
          ctx.rules.some((r) => /border-radius\s*:\s*(50%|9{3,}px)/.test(r.body) && c.cls.split(/\s+/).some((n) => n && r.sel.endsWith(`.${n}`)) && ctx.colorsIn(r.body).some((x) => x.a <= 0.25 || hsl(x).l >= 88));
        if (!circle) continue;
        if (/^[^<]*>\s*(?:<[^>]*>\s*)*(?:✓|✔|<Check(?:Icon|Circle2?)?\b|<svg[^>]*>[\s\S]{0,160}?(?:points=["']20 6 9 17 4 12|lucide-check))/.test(ctx.text.slice(c.idx, c.idx + 400))) h.push({ idx: c.idx });
      }
      return h.length >= 3 ? h : [];
    } },

  // ── Motion ──
  { id: "M1", sev: "P2", name: "The same fade-up entrance on everything",
    why: "opacity 0→1, y 20→0 on every section is the default reveal, not choreography.",
    run(ctx) {
      const h = [...idxOf(/initial=\{\{\s*opacity\s*:\s*0\s*,\s*y\s*:\s*\d+|whileInView=|data-aos=["']fade-up|@keyframes\s+(?:fade-?in-?up|fadeUp|slide-?up)\b/)(ctx)];
      return h.length >= 2 ? h : [];
    } },
  { id: "M4", sev: "P2", name: "Bounce / elastic easing",
    why: "Springy overshoot reads dated and generic unless the product is genuinely playful.",
    run(ctx) {
      const cb = [...matches(ctx.text, /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/)].filter((m) => +m[2] > 1.05 || +m[4] > 1.05 || +m[2] < -0.05 || +m[4] < -0.05).map((m) => ({ idx: m.index }));
      return [...cb, ...idxOf(/\banimate-bounce\b|easeOutBack|easeInOutBack|\belastic\b|bounce\s*:\s*0?\.[3-9]/)(ctx)];
    } },
  { id: "M5", sev: "P2", name: "Count-up stat animation",
    why: "Numbers that tick up on scroll are theater around placeholder proof.",
    run: idxOf(/\bNumberTicker\b|\bCountUp\b|react-countup|useCountUp/) },
  { id: "M7", sev: "P2", name: "Headline that types itself out",
    why: "A letter-by-letter typing headline makes the visitor wait for a sentence they could have read at once.",
    run: idxOf(/typed\.js|new Typed\(|react-type-animation|<TypeAnimation\b|typewriter-effect|<Typewriter\b|\bTypewriterEffect(?:Smooth)?\b|@keyframes\s+(?:typing|typewriter)\b/i) },
  { id: "M8", sev: "P2", name: "Every card lifts on hover",
    why: "A rise-and-shadow on every card, clickable or not, is motion with no meaning; Anthropic lists 'hover transitions on every card'.",
    run(ctx) {
      const css = ctx.rules.filter((r) => /:hover/.test(r.sel) && /card|tile|feature|item|panel|box/i.test(r.sel) && /translateY\(\s*-/.test(r.body)).map((r) => ({ idx: r.idx }));
      const tw = clsHits(ctx, (c) => /\bhover:-translate-y-/.test(c));
      return [...css, ...(tw.length >= 3 ? tw : [])];
    } },
  { id: "M9", sev: "P2", name: "Auto-scrolling logo strip",
    why: "An endless marquee of logos moves so the proof feels busier than it is, and nobody can read it.",
    run(ctx) {
      const kf = [...matches(ctx.text, /@keyframes\s+([\w-]+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/)].filter((m) => /translateX\(\s*-(?:50|100)%|translate3d\(\s*-(?:50|100)%/.test(m[2]) &&
        new RegExp(`animation(?:-name)?\\s*:[^;]*\\b${m[1]}\\b[^;]*infinite|animation\\s*:[^;]*infinite[^;]*\\b${m[1]}\\b`).test(ctx.text)).map((m) => ({ idx: m.index, note: m[1] }));
      return [...kf, ...idxOf(/\banimate-(?:marquee|infinite-scroll|scroll-x|logo-scroll|scroll)\b|react-fast-marquee|<marquee\b/i)(ctx)];
    } },

  // ── Icons ──
  { id: "I2", sev: "P1", name: "Emoji as interface icons",
    why: "Emoji standing in for iconography in features, nav, or footers.",
    run(ctx) { const h = [...matches(ctx.visible, /(?![©®™↔✨✦✧])\p{Extended_Pictographic}/u)].map((m) => ({ idx: m.index })); return h.length >= 2 ? h : []; } },
  { id: "I3", sev: "P1", name: "The worn Lucide set / the sparkle-for-AI glyph",
    why: "Sparkles, Zap, Rocket, Shield, BarChart3, ArrowRight in the same roles, and a sparkle beside anything 'AI'.",
    run(ctx) {
      const out = [];
      for (const m of matches(ctx.text, /import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']/)) {
        const worn = m[1].split(",").map((s) => s.trim()).filter((s) => /^(Sparkles|Zap|Rocket|ArrowRight|CheckCircle2?|Star|Shield|BarChart3|Check)$/.test(s));
        if (worn.length) out.push({ idx: m.index, note: worn.join(", ") });
      }
      return [...out, ...idxOf(/[✨✦✧]/u)(ctx)];
    } },

  // ── Copy ──
  { id: "CP1", sev: "P1", name: "Vague aspirational headline",
    why: "Brand-agnostic filler that could front any product.",
    run: (ctx) => [...matches(ctx.visible, HEADLINE_FLUFF)].map((m) => ({ idx: m.index, note: m[0] }))
      .concat([...matches(ctx.visible, /\b[A-Z][a-z]+ (?:faster|smarter|better)\. [A-Z][a-z]+ (?:faster|smarter|better)\./)].map((m) => ({ idx: m.index, note: m[0] }))) },
  { id: "CP2", sev: "P2", name: "Beige superlatives",
    why: "'Seamless', 'powerful', 'cutting-edge': the microcopy equivalent of beige.",
    run: (ctx) => [...matches(ctx.visible.replace(/<[^>]+>/g, (s) => " ".repeat(s.length)), SUPERLATIVES)].map((m) => ({ idx: m.index, note: m[0] })) },
  { id: "CP3", sev: "P1", name: "Arrow glyph welded to a CTA",
    why: "A '→' appended to button or link text is a reflex flourish.",
    run: idxOf(/[^\s<>"'=]\s?[→⟶➜➔]\s*(?:<\/|["'`])/) },
  { id: "CP4", sev: "P2", name: "Tricolon slogan",
    why: "'Faster, smarter, simpler.' Three single-word adjectives in a row is a generated cadence.",
    run: idxOf(/\b[A-Za-z]+(?:er|ly|est),\s+[a-z]+(?:er|ly|est),\s+(?:and\s+)?[a-z]+(?:er|ly|est)[.!]/) },
  { id: "CP6", sev: "P2", name: "Generic CTA label",
    why: "A CTA should say what happens ('Start a free trial'), not 'Get started' / 'Learn more' / 'Submit'.",
    run: (ctx) => at(ctx, [...matches(ctx.visible, />\s*(get started|learn more|submit|click here)\s*</i)].map((m) => m.index)) },
  { id: "CP7", sev: "P2", name: "'Not X. Y.' slogan",
    why: "'Not another dashboard. A decision engine.' 'No setup. No code. Just results.' A denial-then-reveal cadence models reach for by reflex.",
    run(ctx) {
      const t = ctx.visible.replace(/<[^>]+>/g, (s) => " ".repeat(s.length));
      return [/\bNo [a-z][^.!\n]{0,30}\.\s+No [a-z][^.!\n]{0,30}\.\s+(?:Just|Only)\b/,
        /\bStop [a-z][^.!\n]{0,30}\.\s+Start [a-z]/,
        /(?:^|[.!?>]\s*)Not (?:just )?(?:a |an |another |your )?[a-z][^.!?,\n]{0,30}\.\s+(?:A|An|The|Just|It'?s)\s[^.!?\n]{1,40}[.!]/,
        /\b(?:[Ii]t'?s|[Tt]his is|[Ii]t is) not (?:just )?(?:a |an )?[^.,;\n]{1,30}[,;]\s*(?:it'?s|it is)\b/,
      ].flatMap((re) => [...matches(t, re)].map((m) => ({ idx: m.index + (m[0].length - m[0].trimStart().length), note: m[0].trim().slice(0, 48) })));
    } },
  { id: "CP8", sev: "P2", name: "Unsourced social-proof claim",
    why: "'Trusted by 10,000+ teams' with no names, link, or source is placeholder proof, often for a product with no users yet.",
    run: (ctx) => [...matches(ctx.visible.replace(/<[^>]+>/g, (s) => " ".repeat(s.length)),
      /\b(?:trusted|loved|used|relied on|chosen) by (?:over |more than )?[\d,.]+\s*[KkMm]?\+?\s+[a-z-]+|\bjoin (?:over |more than )?[\d,.]+\s*[KkMm]?\+?\s+(?:teams|developers|companies|users|creators|businesses|marketers|founders|people)\b|\b(?:trusted|loved|used) by (?:thousands|millions|hundreds) of\b/i)]
      .map((m) => ({ idx: m.index, note: m[0] })) },

  // ── Imagery & fingerprints ──
  { id: "IM4", sev: "P1", name: "Placeholder avatars or media",
    why: "Stock avatar services and gray aspect-video boxes are 'nothing real here yet' signals.",
    run: (ctx) => [...idxOf(/dicebear|pravatar|boring-avatars|ui-avatars|robohash|randomuser\.me|placehold\.co|via\.placeholder|picsum\.photos/i)(ctx),
      ...clsHits(ctx, (c) => /\baspect-video\b/.test(c) && /\bbg-(muted|gray|slate|zinc)/.test(c))] },
  { id: "IM5", sev: "P1", name: "A five-star row on every testimonial",
    why: "Five of five stars above each quote is decoration, not a rating anyone gave.",
    run: (ctx) => idxOf(/★{5}|(?:<Star(?:Icon)?\b[^>]*\/>\s*){5}|(?:\[\.\.\.Array\(5\)\]|Array\.from\(\{\s*length\s*:\s*5\s*\}|Array\(5\)\.fill|\[\s*1\s*,\s*2\s*,\s*3\s*,\s*4\s*,\s*5\s*\])[\s\S]{0,200}?(?:<Star|★)/)(ctx) },
  { id: "F1", sev: "P1", name: "Generator signature left in",
    why: "lovable-tagger, v0/Bolt meta tags, or builder attribution tell everyone which tool shipped it.",
    run: idxOf(/lovable-tagger|lovable\.dev|gpt-?engineer|v0\.dev|v0\.app|bolt\.new|name=["']generator["'][^>]*content=["'](?:v0|Lovable|Bolt)/i) },
  { id: "F2", sev: "P2", name: "Section-label comments",
    why: "'{/* Hero Section */}', '<!-- Features Section -->' on every block: the comment trail generated pages leave behind.",
    run(ctx) {
      const h = [...matches(ctx.text, /(?:\{\s*\/\*|<!--|\/\/)\s*(?:Hero|Features?|Pricing|Testimonials?|CTA|Call to Action|FAQ|Footer|Header|Navigation|Navbar|Stats|Logos?|Logo Cloud|How It Works|Main Content|Social Proof)(?:\s+Section)?\s*(?:\*\/\s*\}|-->|$)/im)].map((m) => ({ idx: m.index }));
      return h.length >= 3 ? h : [];
    } },

  // ── Craft & accessibility (whole-page checks) ──
  { id: "K7", sev: "P1", name: "No visible keyboard focus",
    why: "Interactive elements with no :focus-visible style: the polish gap, and an accessibility defect.",
    scope: "page",
    run: (ctx) => /<(button|a|input|select|textarea)\b|onClick/.test(ctx.text) && !/:focus-visible|focus-visible:|:focus\b|focus:/.test(ctx.text) ? [{ idx: 0 }] : [] },
  { id: "M6", sev: "P1", name: "Motion without prefers-reduced-motion",
    why: "Animation that ignores reduced-motion settings fails users who asked for less movement.",
    scope: "page",
    run: (ctx) => /@keyframes|animation\s*:|framer-motion|\bgsap\b|data-aos/.test(ctx.text) && !/prefers-reduced-motion|useReducedMotion|reducedMotion/.test(ctx.text) ? [{ idx: Math.max(0, ctx.text.search(/@keyframes|animation\s*:|framer-motion|\bgsap\b|data-aos/)) }] : [] },
];

function iconChips(ctx) {
  // A class whose CSS rule has a radius and a translucent tinted background, used on ≥2 elements; or the Tailwind equivalent.
  const chipClasses = new Set();
  for (const r of ctx.rules) {
    if (!/border-radius\s*:\s*\d/.test(r.body)) continue;
    // a chip is small and squarish: fixed width and height, both ≤ 72px
    const w = r.body.match(/(?:^|[;\s])width\s*:\s*(\d+)px/), h = r.body.match(/(?:^|[;\s])height\s*:\s*(\d+)px/);
    if (!w || !h || +w[1] > 72 || +h[1] > 72) continue;
    const bg = r.body.match(/background(?:-color)?\s*:\s*([^;]+)/); if (!bg) continue;
    if (!ctx.colorsIn(bg[1]).some((c) => c.a <= 0.2 && is.saturated(c))) continue;
    const last = r.sel.split(/[\s>+~]/).filter(Boolean).pop() || ""; const m = last.match(/^\.([\w-]+)$/); if (m) chipClasses.add(m[1]);
  }
  const out = [];
  for (const c of ctx.classAttrs) {
    const names = c.cls.split(/\s+/);
    if (names.some((n) => chipClasses.has(n)) || (/\brounded-(md|lg|xl|2xl)\b/.test(c.cls) && /\bbg-[a-z]+-\d{2,3}\/(5|10|15|20)\b/.test(c.cls) && /\b(h|size|w)-(8|9|10|11|12|14)\b/.test(c.cls))) out.push({ idx: c.idx });
  }
  return out;
}
const fmt = (c) => `#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

// ── scanning ──────────────────────────────────────────────────────────────────
function walk(p, out, includeExamples) {
  let st; try { st = fs.statSync(p); } catch { return; }
  if (st.isDirectory()) {
    const base = path.basename(p);
    if (SKIP_DIRS.has(base) || (!includeExamples && EXAMPLE_DIRS.has(base))) return;
    for (const e of fs.readdirSync(p)) walk(path.join(p, e), out, includeExamples);
  } else if (EXT.has(path.extname(p).toLowerCase())) {
    if (path.extname(p).toLowerCase() === ".json" && path.basename(p) !== "components.json") return;
    out.push(p);
  }
}

const SELF = fs.realpathSync(new URL(import.meta.url));
function scanFile(file, opts) {
  if (fs.realpathSync(file) === SELF) return [];
  const text = fs.readFileSync(file, "utf8");
  if (!opts.includeExamples && /slop-example/.test(text)) return [];
  const fileIgnore = text.match(/avoid-ai-design-ignore-file(?::\s*([A-Z0-9,\s]+))?/);
  if (fileIgnore && !fileIgnore[1]) return [];
  const ignoredIds = new Set((fileIgnore?.[1] || "").split(/[,\s]+/).filter(Boolean));
  const relRaw = path.relative(process.cwd(), file);
  const rel = !relRaw || relRaw.startsWith("..") ? file : relRaw;
  const ctx = buildContext(file, rel, text);
  const lines = text.split("\n");
  const findings = [];
  for (const rule of RULES) {
    if (SEV[rule.sev] > SEV[opts.min] || ignoredIds.has(rule.id)) continue;
    // whole-page checks only make sense where a file carries its own styles (focus rings and
    // reduced-motion often live in a global stylesheet or layout, not in each component)
    if (rule.scope === "page" && !ctx.isMarkup) continue;
    let hits;
    try { hits = rule.run(ctx) || []; } catch (e) { hits = []; }
    const kept = [];
    for (const h of hits) {
      const ln = ctx.line(h.idx);
      const near = `${lines[ln - 1] || ""}\n${lines[ln - 2] || ""}`;
      const m = near.match(/avoid-ai-design-ignore:\s*([A-Z0-9,\s]+)/);
      if (m && m[1].split(/[,\s]+/).includes(rule.id)) continue;
      kept.push({ line: ln, note: h.note });
    }
    if (!kept.length) continue;
    const lns = [...new Set(kept.map((k) => k.line))].sort((a, b) => a - b);
    findings.push({ file: rel, id: rule.id, severity: rule.sev, name: rule.name, why: rule.why,
      lines: lns, notes: [...new Map(kept.map((k) => k.note).filter(Boolean).map((n) => [n.toLowerCase(), n])).values()].slice(0, 4) });
  }
  return findings.sort((a, b) => SEV[a.severity] - SEV[b.severity] || a.id.localeCompare(b.id));
}

// ── output ────────────────────────────────────────────────────────────────────
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const sevColor = { P0: "31;1", P1: "33;1", P2: "36" };
const linesLabel = (ls) => (ls.length > 4 ? `L${ls.slice(0, 4).join(", L")} (+${ls.length - 4})` : `L${ls.join(", L")}`);

function report(findings, scanned, json) {
  const sum = { P0: 0, P1: 0, P2: 0 };
  for (const f of findings) sum[f.severity]++;
  // The stack: how many distinct tells one file carries. In a 2026 count of 120 AI-built pages, 57 carried
  // six or more and only 20 carried two or fewer; the combination, not any single hit, is what reads as generated.
  const stacks = {}; for (const f of findings) (stacks[f.file] ||= new Set()).add(f.id.replace(/[a-z]+$/, ""));
  const stackOf = (file) => stacks[file]?.size || 0;
  if (json) { process.stdout.write(JSON.stringify({ tool: "avoid-ai-design", version: VERSION, scanned, summary: { ...sum, total: findings.length },
    stacks: Object.fromEntries(Object.keys(stacks).map((k) => [k, { distinct: stackOf(k), template: stackOf(k) >= STACK }])), findings }, null, 2) + "\n"); return sum; }
  console.log(paint("1", `avoid-ai-design detect v${VERSION}`) + paint("2", ` · ${scanned} file${scanned === 1 ? "" : "s"} scanned`));
  const byFile = new Map(); for (const f of findings) (byFile.get(f.file) || byFile.set(f.file, []).get(f.file)).push(f);
  for (const [file, fs_] of byFile) {
    const s = { P0: 0, P1: 0, P2: 0 }; fs_.forEach((f) => s[f.severity]++);
    const n = stackOf(file);
    console.log(`\n${paint("1", file)}  ${paint("2", `P0 ${s.P0} · P1 ${s.P1} · P2 ${s.P2} · stack ${n}`)}${n >= STACK ? paint("31;1", "  template stack") : ""}`);
    for (const f of fs_) {
      console.log(`  ${paint(sevColor[f.severity], f.severity)}  ${f.id.padEnd(4)} ${f.name}  ${paint("2", linesLabel(f.lines))}${f.notes.length ? paint("2", `  · ${f.notes.join(" · ")}`) : ""}`);
      console.log(paint("2", `        ${f.why}`));
    }
  }
  console.log(`\n${paint("1", `${findings.length} finding${findings.length === 1 ? "" : "s"}`)}  P0 ${sum.P0} · P1 ${sum.P1} · P2 ${sum.P2}`);
  console.log(paint("2", `Stack = distinct tells per file; ${STACK} or more reads as a template (57 of 120 AI-built pages in a 2026 count).`));
  console.log(paint("2", "Code-certain signals only. Palette weight, rhythm, and hierarchy need a render (SKILL.md, step 2).\nA finding is a default nobody chose, not proof an AI made it. If the brief asked for it, keep it: avoid-ai-design-ignore: <ID>."));
  return sum;
}

function printRules() {
  for (const r of RULES) console.log(`${r.sev}  ${r.id.padEnd(4)}  ${r.name}${r.scope === "page" ? "  (whole page)" : ""}`);
}

async function readStdin() { const chunks = []; for await (const c of process.stdin) chunks.push(c); return Buffer.concat(chunks).toString("utf8"); }

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const opts = { json: false, min: "P2", includeExamples: false, hook: false, paths: [] };
  for (const a of process.argv.slice(2)) {
    if (a === "--json") opts.json = true;
    else if (a === "--hook") opts.hook = true;
    else if (a === "--include-examples") opts.includeExamples = true;
    else if (a === "--rules") { printRules(); return 0; }
    else if (a.startsWith("--min=")) opts.min = a.slice(6).toUpperCase();
    else if (a === "-h" || a === "--help") { console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n\/\*\n?/, "").replace(/^ \* ?/gm, "")); return 0; }
    else if (a.startsWith("--")) { console.error(`avoid-ai-design: unknown option ${a}`); return 1; }
    else opts.paths.push(a);
  }
  if (!(opts.min in SEV)) { console.error("avoid-ai-design: --min must be P0, P1 or P2"); return 1; }

  if (opts.hook) {
    let file;
    try { file = JSON.parse(await readStdin())?.tool_input?.file_path; } catch { return 0; }
    const ext = file ? path.extname(file).toLowerCase() : "";
    if (!file || !EXT.has(ext) || ext === ".json" || !fs.existsSync(file)) return 0;
    if (!opts.includeExamples && file.split(path.sep).some((seg) => EXAMPLE_DIRS.has(seg))) return 0;
    const serious = scanFile(file, { ...opts, min: opts.min === "P2" ? "P1" : opts.min });
    if (!serious.length) return 0;
    const shown = path.relative(process.cwd(), file);
    console.error(`avoid-ai-design: ${serious.length} AI-design tell${serious.length === 1 ? "" : "s"} in ${!shown || shown.startsWith("..") ? file : shown}`);
    for (const f of serious.slice(0, 10)) console.error(`  ${f.severity} ${f.id} ${f.name} (${linesLabel(f.lines)})`);
    if (serious.length > 10) console.error(`  … and ${serious.length - 10} more (run scripts/detect.mjs on the file for the full list)`);
    console.error("Fix with the avoid-ai-design skill, or keep a deliberate choice with `avoid-ai-design-ignore: <ID>`.");
    return 2;
  }

  const files = [];
  for (const p of opts.paths.length ? opts.paths : ["."]) walk(path.resolve(p), files, opts.includeExamples);
  const findings = files.flatMap((f) => { try { return scanFile(f, opts); } catch (e) { console.error(`avoid-ai-design: cannot read ${f}: ${e.message}`); return []; } });
  const sum = report(findings, files.length, opts.json);
  return sum.P0 + sum.P1 > 0 ? 2 : 0;
}

main().then((code) => process.exit(code), (e) => { console.error(`avoid-ai-design: ${e.stack || e}`); process.exit(1); });
