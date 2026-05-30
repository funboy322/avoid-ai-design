# AI design tells: catalog

The reference catalog for the `avoid-ai-design` skill. Each tell carries a **detection signal**, a one-line reason it **reads as AI**, and a **fix** for both plain HTML/CSS and React/Tailwind/shadcn.

Percentages cited below come from a Playwright analysis of ~1,400 recent Show HN sites ([Krebs, "design slop"](#sources)). Treat them as evidence of how common a pattern is, not a hard threshold.

## Why AI design converges

A model trained on a decade of Tailwind tutorials, shadcn starters, and GitHub snippets regresses to the visual median of that corpus. It does not choose indigo; indigo is the average. The fixes here all do the same thing: replace a default with a decision. Read each "why" as "no one chose this," and each fix as "choose."

**Severity:** **P0** screams AI on sight. **P1** is an obvious smell. **P2** is cosmetic. Fix P0 and P1 on every pass.

---

## Typography

### T1: Inter (or the system stack) for everything · P0
**Detection:** `font-family` is Inter, `-apple-system`, `system-ui`, Roboto, or Arial, with no second face. No display font, no contrast.
**Why AI:** Inter is the default in nearly every AI tool and component library. Anthropic's own frontend guidance lists it first under "avoid." A single neutral sans with no pairing means nothing was chosen.
**Fix (HTML/CSS):** Pair a characterful display face for headings with a clean body face. Load via `@font-face` or a font host. Set them on `:root` as `--font-display` and `--font-body`.
```css
:root { --font-display: "Fraunces", Georgia, serif; --font-body: "Hanken Grotesk", system-ui, sans-serif; }
h1, h2, h3 { font-family: var(--font-display); }
body { font-family: var(--font-body); }
```
**Fix (React/Tailwind):** Map two fonts to `fontFamily` in `tailwind.config` (`font-display`, `font-sans`), load them with `next/font` or a `<link>`, and apply `font-display` to headings. Do not leave Geist/Inter as the only face.

### T2: The "tasteful free font" cluster · P1
**Detection:** Space Grotesk, Geist, Syne, Sora, Instrument Serif, or Fraunces used as the *only* gesture toward design. ~15.8% of analyzed sites used one of a five-font set.
**Why AI:** This is the second-order default. Models reach for the same small set of "indie-startup" Google Fonts to look non-generic, so the non-generic choice became generic. Anthropic calls out **Space Grotesk** by name as overused across its generations.
**Fix:** Keep the font only if it fits the chosen direction, and pair it. Otherwise pick from a wider pool: grotesques (Neue Haas, Aktiv, Söhne, Hanken), serifs (Fraunces, GT Sectra, Tiempos, Newsreader), or a mono (Berkeley, Commit) used with intent. The rule: never ship the font the last three projects shipped.

### T3: Serif-italic accent word in a sans headline · P1
**Detection:** A sans headline with one word in italic serif. "The *modern* way to ship."
**Why AI:** This is a recognizable Claude signature, its go-to move for instant "editorial" flavor. It reads as a template because it is one.
**Fix:** If you want emphasis, earn it through weight, size, or color within the chosen type system, not a borrowed serif italic. Use a real serif/sans contrast only if the whole design commits to it, not as a one-word garnish.

### T4: Geist untouched on a Next.js site · P1
**Detection:** `GeistSans` / `GeistMono` from `next/font`, unchanged, on a deployed site.
**Why AI:** Geist is the Next.js 15+ default. Shipping it untouched says "deployed the starter, never themed it."
**Fix:** Replace or pair Geist deliberately. Keep Geist Mono for code if you like it, but give headings a face that belongs to the brand.

### T5: Reflexive all-caps eyebrow labels · P2
**Detection:** Every section opens with an uppercase, letter-spaced micro-label. ~10.5% used all-caps headlines.
**Why AI:** The "dark SaaS" default eyebrow, applied to every section without thought.
**Fix:** Use eyebrows sparingly. Vary section openers: a number, a short question, a lowercase kicker, or nothing.

---

## Color & gradients

### C1: The purple/indigo-to-blue diagonal gradient · P0
**Detection:** `linear-gradient(135deg, ...)` from indigo/violet to blue in the hero, CTA, or as a background glow.
**Why AI:** The canonical tell, "the Purple Problem." It traces to Tailwind UI defaulting buttons to `bg-indigo-500`; Adam Wathan publicly owned the downstream effect in 2025. The color was never tied to a brand.
**Fix (HTML/CSS):** Choose a dominant brand color and one sharp accent. If you want a gradient, keep it tonal within a single hue, or build a duotone from the brand colors, not the stock indigo→violet.
```css
:root { --ink:#101010; --paper:#f4f1ea; --accent:#e4572e; } /* a decision, not a default */
```
**Fix (React/Tailwind):** Replace `bg-gradient-to-br from-indigo-500 to-purple-600` with committed palette tokens via CSS variables. Never use indigo/violet as the unchosen accent. A flat, confident color beats a timid gradient.

### C2: Indigo / violet CTA buttons · P1
**Detection:** Primary buttons are `bg-indigo-600` / `bg-violet-500`. ~10.7% of sites.
**Why AI:** Same root as C1. The accent defaulted instead of being chosen.
**Fix:** Tie the primary action to the brand's dominant or accent color. Give it a real hover and active state (see K7).

### C3: "VibeCode purple" dark theme · P1
**Detection:** Dark background, low-contrast medium-grey body text, purple accent.
**Why AI:** The unmodified "modern dark mode" cluster. Low body contrast also fails accessibility.
**Fix:** Pick a dark palette with intent: a warm near-black, a real text color at AA+ contrast, and an accent that means something. Avoid grey-on-grey body text.

### C4: Timid, evenly distributed palette · P0/P1
**Detection:** Several colors at similar weight, no clear dominant, no sharp accent.
**Why AI:** AI spreads color evenly and avoids commitment. Intentional brands do the opposite: one dominant color carries the page, an accent punctuates it.
**Fix:** Use the 60/30/10 discipline. One dominant, one secondary, one accent used sparingly for emphasis. Commit.

### C5: Colored glow box-shadows · P2
**Detection:** Cards or buttons with a vibrant colored shadow (e.g. `shadow-indigo-500/50`). ~4.3% of sites.
**Why AI:** Decoration with no function. A glow that says nothing.
**Fix:** Use shadow for elevation, not color theater. If you want atmosphere, build it into the background, not as a glow under every card.

---

## Layout & composition

### L1: The centered hero template · P0
**Detection:** Pill badge, centered H1, centered subhead, one or two centered CTAs. ~23.5% centered titles; the badge-above-headline is its own tell.
**Why AI:** The default "landing page" skeleton. The composition makes no spatial decision.
**Fix (HTML/CSS):** Break symmetry. Try a left-aligned hero with an asymmetric visual, an oversized type-driven hero, a split layout, or an editorial grid where content sits off-center. Let one element be dramatically larger.
**Fix (React/Tailwind):** Replace the `flex flex-col items-center text-center` hero with a `grid` that places headline, supporting text, and media on an intentional grid. Drop the pill badge unless it carries real news.

### L2: Three identical icon-topped feature cards · P0
**Detection:** A row of three (or six) cards, each with a small icon, a short title, and a line of text, all the same height and padding. ~20% of sites.
**Why AI:** The most clichéd SaaS pattern. Identical cards read as machine-laid-out.
**Fix:** Vary the layout. Alternate text-and-visual rows, use a feature with one large showcase and smaller supporting points, or write the features as prose with inline emphasis. If a grid is right, vary card size and content density so it does not read as a template.

### L3: Bento grid as the default composition · P1/P2
**Detection:** A mixed-size tile grid used because it is trendy, not because the content needs it.
**Why AI:** A real 2025 pattern, now saturated. Reads AI when it is the reflex composition rather than a choice driven by the content.
**Fix:** Use a bento grid only when tiles genuinely differ in importance and the sizes encode that. Otherwise pick a layout that fits the content's actual hierarchy.

### L4: The generic stat / social-proof strip · P1
**Detection:** A band of round numbers: "10,000+ users · 99.9% uptime · 4.9★". ~12.2% of sites.
**Why AI:** The numbers are placeholders, often for a product with no users. Hollow proof.
**Fix:** Use real numbers or cut the strip. A single specific, true metric beats four invented ones.

### L5: Numbered 1-2-3 "How it works" · P2
**Detection:** A three-step sequence with big numerals. ~9.4% of sites.
**Why AI:** Formulaic filler structure.
**Fix:** Keep it only if the process genuinely has ordered steps. Otherwise show the product doing the thing.

---

## Components

### K1: Untouched shadcn/ui defaults · P0
**Detection:** Default `zinc`/`slate` base from `components.json`, default `--radius`, unstyled Card/Button/Badge. ~23.5% of sites shipped these unmodified.
**Why AI:** The framework-level tell. The starter was deployed without theming.
**Fix:** Theme shadcn before shipping. Change the base color and radius in `components.json`/CSS variables, restyle the primitives you use most (Button, Card), and set your own type scale. shadcn is a starting point, not a look.

### K2: `rounded-2xl shadow-lg` on everything · P1
**Detection:** Uniform large border-radius and a soft shadow (often ~0.1 opacity) on every surface.
**Why AI:** Identical radius plus identical padding plus identical card heights flattens hierarchy into a template.
**Fix:** Use radius and elevation to express hierarchy, not as a global default. Vary radius by element role. Let some surfaces be flat, some sharp. Reserve strong shadows for things that genuinely float.

### K3: Glassmorphism / `backdrop-blur` by reflex · P1
**Detection:** Frosted, semi-transparent nav and cards with `backdrop-blur`. ~17% of sites.
**Why AI:** A genuine trend, but applied to everything without reason. Glass on glass on glass.
**Fix:** Use a blurred translucent surface only where layering is real (a nav over scrolling content). Everywhere else, use a solid surface with a considered color.

### K4: Colored left/top border-accent cards · P1
**Detection:** Cards with a colored left or top border stripe. ~13% of sites.
**Why AI:** As Krebs puts it, "colored left borders are almost as reliable a sign of AI-generated design as em-dashes are for text."
**Fix:** Drop the stripe. If a card needs emphasis, use weight, scale, background, or position. Differentiate by content, not a ribbon.

### K5: Pill badge above the title · P2
**Detection:** A small capsule, often with a sparkle emoji: "✨ New: v2 is here". ~4.7% of sites.
**Why AI:** A default ornament that announces nothing.
**Fix:** Remove it unless it carries real, dated news. If it does, style it to the brand, not the stock pill.

### K6: Lucide icon in a rounded-square chip · P1
**Detection:** A Lucide icon centered in a tinted `rounded-xl` square, one per feature.
**Why AI:** Lucide ships with shadcn; the rounded-square chip is the stock "feature icon" treatment, used unedited.
**Fix:** Choose an icon set that fits the direction (or commission/draw simple custom marks). Drop the chip, or make the icon treatment a real design decision (line weight, size, color, position). Consider numbers or no icons at all.

### K7: Missing component states · P1
**Detection:** Hover states that do nothing, buttons that snap with no transition, forms with no focus/error/required/disabled/loading states.
**Why AI:** The polish gap. Generated UI renders the happy path and skips the states a craftsperson would build.
**Fix (HTML/CSS):** Add `:hover`, `:focus-visible`, `:active`, and `:disabled` styles, and a `transition`. Design error and empty states.
**Fix (React/Tailwind):** Implement `hover:`, `focus-visible:`, `disabled:`, and loading/error variants. Wire real validation states into forms.

---

## Spacing

### S1: Uniform padding, no rhythm · P2
**Detection:** The same `gap` and `p-*` on most things; whitespace distributed evenly.
**Why AI:** Even spacing makes a flat hierarchy. Nothing is emphasized because everything breathes the same.
**Fix:** Use a spacing scale to create rhythm. Give sections distinct vertical space by importance. Use whitespace as composition: crowd some things, isolate others.
**Note:** This is the softest category. Sources describe it as "uniform" without naming values. Weight it below the font, color, and component tells.

---

## Motion

### M1: The same fade-up-on-scroll on everything · P2
**Detection:** Every section reveals with an identical fade-and-rise.
**Why AI:** Reflexive, not choreographed. The default AOS reveal.
**Fix:** Pick one or two high-impact moments. One well-staggered page-load entrance delivers more than a uniform reveal on every block. Vary easing and intent.

### M2: Scattered micro-interactions, no orchestration · P2
**Detection:** Many small random hovers and bounces, no coherent motion language.
**Why AI:** Motion sprinkled on rather than designed.
**Fix:** Define a motion language: shared easing, shared duration scale, a clear entrance. One orchestrated load beats scattered fidgets.

### M3: The copied "Linear glow" · P2
**Detection:** A dark hero with a blurred animated gradient glow behind a product shot.
**Why AI:** "The Linear effect," lifted wholesale onto an unrelated product.
**Fix:** Borrow the principle (atmosphere, depth), not the exact effect. Build atmosphere that fits your own direction.

---

## Icons

### I1: Lucide untouched
See **K6**. The default set used as-is, one per feature card.

### I2: Emoji as feature bullets or in the nav · P1
**Detection:** Emoji standing in for icons in features or navigation. ~3.8% had emoji in nav.
**Why AI:** A lazy substitute for real iconography.
**Fix:** Use a real icon set chosen for the direction, or custom marks. Reserve emoji for genuinely casual, human contexts, never as the system's iconography.

---

## Copy & microcopy

### CP1: Vague aspirational headline · P1
**Detection:** "Build the future of work." "Your all-in-one platform." "Scale without limits." "Elevate your workflow."
**Why AI:** Brand-agnostic filler that could front any product. Says nothing specific.
**Fix:** Write what the product actually does, for whom, in concrete terms. Specificity is the opposite of slop.

### CP2: Generic superlatives and hedging · P2
**Detection:** "best-in-class," "cutting-edge," "seamless," "powerful," "may help you."
**Why AI:** The microcopy equivalent of beige.
**Fix:** Replace with a concrete claim, a number, or a verb. For full prose, run the text through the `avoid-ai-writing` skill.

---

## Imagery

### IM1: Stock "diverse team at a laptop" · P1
**Detection:** A bright open-plan office, a smiling team around a screen.
**Why AI:** The visual default for "company."
**Fix:** Use real product screenshots, real photography, or a considered illustration style that fits the direction.

### IM2: AI 3D glossy blobs · P1
**Detection:** Plastic-looking abstract 3D shapes as hero or section art, with a tell-tale glossy sheen.
**Why AI:** Generated filler with no subject.
**Fix:** Show the actual product, or commission art with a point of view. If you use abstract forms, make them specific to the brand.

### IM3: Corporate Memphis blob-people · P2 (precursor)
**Detection:** Flat illustrations of people with tiny heads, long bendy limbs, no faces, flat bright fills.
**Why AI:** A pre-AI corporate trend (Buck's "Alegria," 2017) now widely declared dead, but still reproduced by image tools as "friendly corporate." Lineage, not a fresh AI tell.
**Fix:** Choose an illustration style with a real voice, or skip illustration for photography or product UI.

---

## What not to over-flag

A pattern is a tell when it is a **default reached for without reason**, not whenever it appears. Calibrate:

- **One gradient, used well and tied to the brand, is not slop.** C1 is about the *unchosen* indigo→violet, not gradients in general.
- **Glassmorphism and bento grids** are legitimate when the content calls for them. Flag them only as reflexive defaults.
- **Spacing (S1)** is a soft signal. Do not lead an audit with it.
- **Corporate Memphis** is pre-AI context, not evidence a model made something.
- A confident, intentional design that happens to be minimal is not "timid." Restraint executed well is a decision. Reward it.

---

## Sources

1. Adrian Krebs, "Show HN submissions… the same vibe-coded look" (design slop study, ~1,400 sites): https://adriankrebs.ch/blog/design-slop/
2. GIGAZINE, write-up of the design-slop study: https://gigazine.net/gsc_news/en/20260423-design-slop/
3. Anthropic, "Prompting for frontend aesthetics" (Claude Cookbook): https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics
4. "Why Every AI-Built Website Looks the Same (Blame Tailwind's Indigo-500)": https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p
5. "Why Your AI Keeps Building the Same Purple Gradient Website": https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
6. Daryl Ginn, "The Linear effect": https://rectangle.substack.com/p/the-linear-effect
7. "AI Slop Web Design: Spotting and Fixing Generic Websites" (925studios): https://www.925studios.co/blog/ai-slop-web-design-guide
8. "Your AI Slop Bores Me" (Know Your Meme): https://knowyourmeme.com/memes/sites/your-ai-slop-bores-me
9. "Claude Design: Build Branded Interfaces Without Generic AI Aesthetics" (MindStudio): https://www.mindstudio.ai/blog/claude-design-avoid-generic-ai-aesthetics
10. "Corporate Memphis" (Wikipedia): https://en.wikipedia.org/wiki/Corporate_Memphis

*The "colored left borders ≈ em-dashes" line is from source 1. Per-pattern percentages are from sources 1–2. The Tailwind `indigo-500` origin and Adam Wathan's 2025 acknowledgment are from sources 4–5.*
