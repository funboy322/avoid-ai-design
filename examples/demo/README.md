# Demo: one AI page, run through the skill

Every page here is the **same product, same sections, same copy**: a generic AI-built SaaS
landing page for a fictional analytics tool, "Cadence." The only variable is design, so the
before/after and the alternatives isolate exactly what the skill changes.

## The before/after run

| File | What it is |
|---|---|
| [`slop.html`](slop.html) | The page an AI tool emits unprompted. Purple-to-blue gradient, Inter, centered hero, three icon cards, glass nav. |
| [`refined.html`](refined.html) | The after, direction "Cohort": the retention cohort table is the hero, the page is built like a table, the table's heat ramp is the only color. |
| [`AUDIT.md`](AUDIT.md) | The full run: the audit, the scanner cross-check, the grounding and default review, what changed, the re-audit, and what the previous version got wrong. |

Scan it yourself:

```bash
node scripts/detect.mjs --include-examples examples/demo/slop.html     # 23 findings
node scripts/detect.mjs --include-examples examples/demo/refined.html  # none
```

(`--include-examples` is needed because the scanner skips `examples/` by default.)

## Lesson 1: derive the direction from the product, and there is more than one

The same page, rebuilt four ways. None was picked from a style menu; each comes from a
different part of Cadence's own world, and each scans clean of first- and second-order
defaults.

| File | Grounded in | The moves |
|---|---|---|
| [`refined.html`](refined.html) | the retention cohort table | cool grey ground, navy ink, one blue heat ramp, Schibsted Grotesk, rows instead of cards |
| [`after-tempo.html`](after-tempo.html) | the name: a cadence is a rhythm | the week as a step sequencer, a musical double barline, expanded Archivo, black with brass |
| [`after-wallboard.html`](after-wallboard.html) | where it lives: the TV on the team's wall | huge numerals in Big Shoulders Display (a signage face), amber for live values, a justified dark navy |
| [`after-funnel.html`](after-funnel.html) | the question every user asks: where do people drop off? | a real funnel as the hero, bands that narrow like one, Young Serif with Atkinson Hyperlegible, one raspberry in steps |

Side-by-side still: [`../../docs/variants.png`](../../docs/variants.png).

> **What these replaced.** The earlier alternates (warm editorial with vermilion, a lime
> monospace "instrument," a near-black console with phosphor green, an ultramarine
> editorial) escaped the purple gradient and landed in the second-order clusters: cream
> with terracotta, near-black with acid green, all-caps mono chrome, one accented headline
> word, decorative 01/02/03. The v0.4 scanner flags every one of them. See
> [`AUDIT.md`](AUDIT.md), section 5.

## Lesson 2: one design system, every page

A second page has to look like it belongs to the first, or the project falls apart. This
is **AI design-system drift** (catalog tell **X1**).

| File | What it is |
|---|---|
| [`faq.html`](faq.html) | A Cadence FAQ built on `refined.html`'s exact tokens: the same header and footer, the same type, the same heat ramp, the same table-like rows. The same product. |
| [`faq-drift.html`](faq-drift.html) | The same FAQ content, regenerated from scratch. It reverts to the median: indigo gradient, Inter, rounded shadow cards, glass nav. Passable alone; next to the home page it shows two templates built one product. |

For a real multi-page project, write the shared system down once in a `DESIGN.md`
([template](../../references/design-md-template.md)) and build every page from it.

Side-by-side still: [`../../docs/consistency.png`](../../docs/consistency.png).

## Why some findings are ignored in these files

Each "after" carries `avoid-ai-design-ignore-file: L4, L9, CP2, CP6`. Those four are the
stat numbers, the section order, and two bits of copy, all held identical to `slop.html`
on purpose so that only the design varies. That is the ignore mechanism doing its job: a
deliberate choice, written down with its reason.

## Files prefixed `_`

`_compare.html`, `_pages.html`, `_variants.html`, `_og.html`, and `_x.html` are layout
scaffolds used only to render the images in `docs/`; they are not part of the lesson.
