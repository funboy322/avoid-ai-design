# Demo: avoid-ai-design run on a real AI-generated site

This is an actual run of the skill, start to finish, on one page. The "before" is
[`slop.html`](slop.html), a generic SaaS landing page of the kind AI tools produce
unprompted. The "after" is [`refined.html`](refined.html). **The product, sections, and
copy are identical between the two files** so the only variable is the design.

Both pages were rendered to pixels before auditing, and both were run through the
scanner (`scripts/detect.mjs`), so the findings below are judged from the source, the
render, and the scanner together.

*Updated for v0.5. The first "after" of this demo (warm paper, vermilion, Helvetica)
passed the v0.3 checks and then failed the second-order check added in v0.4. Section 5
explains what it got wrong. The v0.4 rebuild then failed the one-note check added in
v0.5; section 6 covers that. Everything below is the current run.*

---

## 1. Audit (`detect` mode output)

22 tells found. Grouped by severity. IDs reference [`../../references/ai-tells-catalog.md`](../../references/ai-tells-catalog.md).

### P0: screams AI on sight (5)

| ID | Where | Why it reads as AI |
|----|-------|--------------------|
| C1 | hero glow, buttons, stats panel, CTA band | The indigo-to-violet-to-pink gradient everywhere. The Purple Problem. No brand chose it. |
| C6 | `<h1>` "just works", stat numbers | `bg-clip-text` gradient text, the 2024 default flourish. |
| T1 | `body` | Inter / system stack for everything, no pairing, no display face. |
| L1 | hero | Pill badge + centered H1 + centered subhead + two centered CTAs: the default skeleton. |
| L2 | features | Three identical icon-topped cards, equal height and padding. |

### P1: obvious AI smell (12)

| ID | Where | Why it reads as AI |
|----|-------|--------------------|
| C2 | all primary buttons | Indigo/violet gradient CTAs, the accent defaulted instead of chosen. |
| K3 | nav | Glassmorphism (`backdrop-blur`) by reflex. |
| K2 | cards, mock, tiers | `rounded-2xl` + soft shadow on every surface. |
| K6 | feature cards | Icon (here emoji) sitting in a tinted rounded square. |
| K7 | every button/link | No real hover, focus, or active states. The polish gap. |
| I2 | features, footer | Emoji standing in for iconography (📊 ⚡ 🚀, 🐦 💼 🐙). |
| L4 | stats strip | "12,000+ / 8B / 4.9★ / 99.99%": round hollow proof. |
| L6 | whole page | One centered `max-width` shell for every section; no spatial decision. |
| L7 | pricing | Three tiers, middle one scaled + ringed + "Most Popular" gradient pill. |
| L8 | footer | Default four-column footer + newsletter input + social row. |
| IM | hero visual | A glassy gradient placeholder, not a real product view. |
| CP3 | hero & CTA band | `→` arrow glyphs welded to CTAs ("Start for free →"). |

### P2: cosmetic (5)

| ID | Where | Why it reads as AI |
|----|-------|--------------------|
| K5 | hero | "✨ Powered by AI" pill badge that announces nothing. |
| C5 | hero mock, buttons | Colored (indigo) glow shadows used as decoration. |
| T5 | logos label, footer | Reflexive all-caps letter-spaced micro-labels. |
| CP1 | headline, sections | Vague aspirational copy ("just works", "Ready to get started?"). |
| CP2 | subhead | "Seamlessly powerful, beautifully simple." Beige superlatives. |

**Scanner cross-check.** `node scripts/detect.mjs --include-examples examples/demo/slop.html`
reports 23 code-certain findings (P0 5, P1 14, P2 4). It confirms most of the table above
and adds five the first pass missed: **T7** (Inter is declared but never loaded, so the
page actually renders in the system font), **SD5** (one gradient-colored word in the
headline), **L9** (the stock section order), **CP6** ("Get Started" says nothing about
what happens), and **I3** (the ✨ sparkle as the "AI" badge). Four findings above came
only from reading the render and the copy: the glassy placeholder (IM), the one-width
shell (L6, written in plain CSS rather than Tailwind), the two all-caps labels (T5, under
the scanner's threshold of three), and the vague headline (CP1). The scanner and the
render each see what the other cannot.

---

## 2. Grounding and plan

**The subject, before any style.** Cadence is product analytics for small, fast-moving
product teams. Its world is made of event streams, funnels, and above all the retention
cohort table: rows of signup weeks, columns of weeks since signup, cells shaded by how
many people are still active. That table is the most characteristic thing in the
product's world, and no competitor's landing page opens with it.

**The plan: "Cohort."**

- **Color:** a neutral grey ground (`#f3f3f1`), graphite ink (`#232323`), a neutral muted
  grey for secondary text (`#5c5c59`, 6.0:1 on the ground), and one diverging ramp taken
  from the chart itself: each cell is shaded by how many points it sits below (ochre,
  `#d9952b` and `#f1d29a`) or above (blue, `#b9d3ee` and `#2f6db5`) the median cohort at
  the same week. Two hues, two meanings, and nothing else on the page is colored. The
  ramp also tells the page's one story: newer cohorts, after the onboarding change the
  team annotated, retain better.
- **Type:** Schibsted Grotesk, one family, loaded rather than assumed. Tabular figures
  only inside the table.
- **Layout:** the page is built like the table: rows and rules instead of cards, features
  as rows with a small live visual in the right column, stats as a totals row, pricing as
  columns you compare side by side.
- **Signature:** the cohort table is the hero. The brand mark is a three-row cohort
  triangle in the ramp colors, ochre at the top, blue at the bottom.
- **Motion:** none beyond hover and focus. A table does not need to perform.

**Default review (step 6).** Three instincts were cut before any code:

1. Warm paper, a vermilion accent, Helvetica. That was this demo's previous answer, and
   it is the Claude-look cluster (SD1). Cut.
2. Monospace all-caps labels and `·` meta strings for a "data" feel. Template chrome
   (SD4). Cut: labels are sentence case in the one family.
3. Numbering the three features 01 / 02 / 03. They are not a sequence (SD6). Cut.

**Alternatives,** each built as a full page and each drawn from a different part of the
product's world:

- [`after-tempo.html`](after-tempo.html): the name. A cadence is a rhythm, so the week
  becomes a step sequencer and sections end on a musical double barline.
- [`after-wallboard.html`](after-wallboard.html): where the product lives, on the TV on
  the team's wall. Huge numerals in a signage face, amber for live values, on a neutral
  charcoal.
- [`after-funnel.html`](after-funnel.html): the question every user asks. The hero is a
  funnel, and the page narrows like one.

---

## 3. What changed

- **Hero (C1, C6, L1, K5, IM, SD5):** the gradient, the pill, and the glassy mock are gone.
  The headline is set whole, with no accented word. The hero visual is a real cohort
  table with a caption and a key.
- **Type (T1, T7):** Inter-that-never-loaded became Schibsted Grotesk, loaded from a font
  host, with one real scale.
- **Features (L2, K2, K6, I2):** three identical emoji cards became three rows of a table,
  each with a small visual of that feature (a live line, a funnel, a team annotation).
  No chips, no emoji, no numbers.
- **Stats (L4):** the numbers stay (the copy is held constant), presented as the totals
  row of the table.
- **Pricing (L7):** no scale, no ring, no "Most Popular" pill. The three plans sit side by
  side like columns to compare; Pro is shaded and marked "Recommended."
- **Buttons (C2, K7, CP3):** gradient pills became graphite buttons with real hover and
  `:focus-visible` states, and the arrow glyphs are gone.
- **Nav and footer (K3, L8):** glass became a plain header; the footer keeps the columns
  the site has.

---

## 4. Re-audit and judgment

`node scripts/detect.mjs --include-examples examples/demo/refined.html` reports **no
findings**. With the file's ignore comment removed, four remain, all content held
constant on purpose so that only the design varies: **L4** (the stat numbers), **L9**
(the section order), **CP2** ("Seamlessly powerful, beautifully simple"), and **CP6**
("Get started"). The copy and the structure are the next pass: run the copy through
[`avoid-ai-writing`](https://github.com/conorbronsdon/avoid-ai-writing), and question
whether a product-analytics page needs this section order at all.

Against the four success tests:

1. **Justified:** every change maps to a flagged tell, and the direction traces to the
   subject (the cohort table).
2. **Coherent:** one family, one ramp, one structural idea (the table), and the boldness
   spent in one place (the hero).
3. **Not a second-order default:** the scanner finds no SD tell, and the default review
   cut the three instincts that would have landed in one.
4. **Consistent:** [`faq.html`](faq.html) is built on the same tokens, header, footer, and
   type. The two pages read as one product.

---

## 5. What v0.3 got wrong

The previous `refined.html` swapped the purple slop for warm paper (`#f5f4f1`), a
vermilion accent, Helvetica, monospace all-caps eyebrows, one vermilion word in the
headline, features numbered 01 to 03, and a dashboard mock wearing three window dots. It
cleared every first-order tell. Run through the v0.4 scanner, it reports SD1 (cream plus
terracotta), SD4 (template chrome), SD5 (one accented headline word), SD6 (decorative
numbering), and SD7 (fake window chrome), with no visible focus style to boot. The three
alternates built alongside it fared no better: the dark "console" version was SD2 to the
letter.

That is the second-order default: the fix that looks tasteful because everyone reaches
for it. Anthropic's own `frontend-design` skill now lists these clusters, and v0.4 of
this skill checks for them by name. The lesson is not "avoid these colors." It is: derive
the direction from the product, then check that you did.

---

## 6. What v0.4 got wrong

The v0.4 `refined.html` escaped every second-order cluster and still landed in a default
nobody had named yet. Its ground was a blue-grey (`#f4f6f8`), its ink a navy (`#10233b`),
its muted text a slate, its rules a blue-grey, and its only accent a five-step blue ramp:
twelve tinted colors within four degrees of hue. It looked coherent because one hue was
doing every job. OpenAI's GPT-5.5 frontend guide now lists "dark blue/slate" palettes and
"one-note palettes" among the defaults its own model should avoid, and the v0.5 scanner
reports it as **C10**. The Wallboard alternate was a dark navy ground, which the same
guide names, so v0.5 reports it as **SD9**.

The repaint keeps the direction and changes what color means. The ground and ink went
neutral, and the heat ramp became a diverging scale against the typical cohort, so the
page carries two hues with two jobs instead of one hue with all of them. Wallboard moved
to a neutral charcoal, and its huge numerals stay behind an ignore comment, because a
wallboard is read from across a room and the number is the product (**L11** is the brief
here, not a reflex).

The lesson is the same as section 5, one level up: every escape becomes the next median.
Check the plan against the newest lists, not only the ones you already know.
