# Demo: avoid-ai-design run on a real AI-generated site

This is an actual run of the skill, start to finish, on one page. The "before" is
[`slop.html`](slop.html), a generic SaaS landing page of the kind AI tools produce
unprompted. The "after" is [`refined.html`](refined.html). **The product, sections, and
copy are identical between the two files** so the only variable is the design.

Both pages were rendered to pixels before auditing (the skill's step 2), so the visual
tells below are judged from the rendered page, not guessed from source.

---

## 1. Audit (`detect` mode output)

21 tells found. Grouped by severity. IDs reference [`../../references/ai-tells-catalog.md`](../../references/ai-tells-catalog.md).

### P0: screams AI on sight (5)

| ID | Where | Why it reads as AI |
|----|-------|--------------------|
| C1 | hero glow, buttons, stats panel, CTA band | The indigo→violet→pink gradient everywhere. The Purple Problem. No brand chose it. |
| C6 | `<h1>` "just works", stat numbers | `bg-clip-text` gradient text, the 2024 default flourish. |
| T1 | `body` | Inter / system stack for everything, no pairing, no display face. |
| L1 | hero | Pill badge + centered H1 + centered subhead + two centered CTAs: the default skeleton. |
| L2 | features | Three identical icon-topped cards, equal height and padding. |

### P1: obvious AI smell (11)

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

### P2: cosmetic (5)

| ID | Where | Why it reads as AI |
|----|-------|--------------------|
| K5 | hero | "✨ Powered by AI" pill badge that announces nothing. |
| C5 | hero mock, buttons | Colored (indigo) glow shadows used as decoration. |
| T5 | logos label, footer | Reflexive all-caps letter-spaced micro-labels. |
| CP1 | headline, sections | Vague aspirational copy ("just works", "Ready to get started?"). |
| CP2 | subhead | "Seamlessly powerful, beautifully simple." Beige superlatives. |

---

## 2. Direction committed

**Editorial-technical (Swiss-leaning).** One idea, executed across the page:

- **Type:** Helvetica Neue throughout, heavy weight and tight tracking for display; a monospace (`SF Mono`) for labels, numerals, and eyebrows. No serif (a deliberate choice: the warm-serif look has itself become an AI default).
- **Palette:** warm paper + near-black ink + **one** signal color, a vermilion `#e5402b`. Mostly monochrome; the accent only marks what matters (active states, key numbers, one headline word).
- **Layout:** a strict grid. Asymmetric hero (copy left, real product view right). Hairline rules instead of cards. Numbered sections.
- **Motion:** none beyond a 1px button lift. A landing page does not need scroll theater.
- **Signature detail:** monospace labels + section numbers + the single vermilion accent on an otherwise quiet page.

Alternatives considered: industrial/utilitarian (too cold for a sales page), warm editorial (skipped to avoid the second-order-default trap).

---

## 3. What changed

- **Hero (C1, C6, L1, K5, IM):** dropped the gradient and the `✨` pill. Solid ink headline with one word in vermilion. Centered template replaced with a left-aligned grid; the glassy gradient blob replaced with a real dashboard view (KPIs + a line chart). Added three concrete proof points (No SQL / 5 min / SOC 2) instead of the badge.
- **Type (T1):** Inter to Helvetica Neue with a real weight scale; monospace for labels.
- **Features (L2, K2, K6, I2):** three identical shadow cards replaced with a three-column row on a hairline grid, numbered 01–03, no chips, no emoji.
- **Stats (L4, C6):** kept the numbers, moved them into a dark band for rhythm and contrast; mono labels, the accent on the deltas.
- **Pricing (L7):** removed the scale, the ring, and the gradient "Most Popular" pill. Pro is marked with a quiet mono "Recommended" label and a solid ink button.
- **Buttons (C2, K7):** gradient pills to solid ink with a real hover lift; ghost variant gets a real border.
- **Footer (L8):** four columns to a focused set; emoji social row to text links; a real newsletter field instead of the stock box.
- **Nav (K3):** glass to a solid bar with a hairline.

---

## 4. Re-audit and judgment

Re-ran the catalog over `refined.html`:

- **Zero P0 tells remain.** No gradient, no gradient text, no centered-hero template, no Inter, no identical-card row.
- **P1/P2 cleared:** glass, default footer, pricing ring, emoji, colored glows, the pill, all gone.
- **Knowingly left in scope:** **CP1 and CP2 (copy)**. The headline and subhead still read a bit generic. That is a *writing* problem, not a design one, so it is out of scope for this pass. Run the copy through the [`avoid-ai-writing`](https://github.com/conorbronsdon/avoid-ai-writing) skill to finish the job. Holding the copy constant is also what makes this a fair before/after.

Against the three success tests:

1. **Justified**: every change maps to a flagged tell above.
2. **Coherent**: Helvetica + mono + the single vermilion + the grid reinforce one editorial-technical idea.
3. **Not a re-run**: chose Swiss over the warm-editorial default on purpose, to avoid converging on the skill's own median.

Result: the same site, now with a point of view.
