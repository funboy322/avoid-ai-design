# Changelog

## 0.4.0 (2026-09-24)

The first "after" in this repo's own demo looked tasteful and still read as AI-made. This release is about why that happens, and about catching it in code.

### Added

- **A scanner with no dependencies.** `scripts/detect.mjs` checks source for 50 code-certain tells and reports them by catalog ID and severity. It has JSON output, exits with 2 on any P0 or P1 (so it can gate CI), honors ignore comments for choices a brief asked for, and has a `--hook` mode for a Claude Code `PostToolUse` hook. Regression tests live in `scripts/detect.test.mjs`.
- **Second-order defaults (SD1 to SD8).** The looks models land on once they avoid the purple gradient, built on the five clusters Anthropic's `frontend-design` skill now lists: cream with a terracotta accent, near-black with one acid-green accent, broadsheet cosplay, the card kit, and template chrome. Also one accented headline word, decorative 01 / 02 / 03, fake window dots, and the emerald fallback.
- 17 more tells since the last release: a face declared but never loaded (T7), one family at a flat scale (T6), dark mode nobody asked for (C7), one hue pretending to be two (C8), muted text below WCAG AA (C9), the cookie-cutter section order with the silhouette test (L9), stock Aceternity and Magic UI effects (K10), cards inside cards (K11), status-chip soup (K12), bounce easing (M4), count-up stats (M5), motion that ignores reduced-motion (M6), tricolon slogans (CP4), Title Case Everything (CP5), generic CTA labels (CP6), generator signatures left in (F1), and design-system drift across pages (X1).
- `references/design-md-template.md`: a contract for multi-page work in Google's open DESIGN.md format.
- The catalog marks every tell by how you confirm it: the scanner, a render, or judgment.

### Changed

- The workflow grounds each direction in the product's own world, writes a compact plan, and reviews that plan against the defaults before any code is written.
- `aesthetic-directions.md` is now a vocabulary, not a menu. Each direction names the default cluster it sits next to.
- The demo is rebuilt. Four directions for the same analytics page (Cohort, Tempo, Wallboard, Funnel) each come from the product, and the scanner finds no design tells in any of them. A second page (FAQ) shows one system across pages, next to a copy that drifted.
- "What not to over-flag" now says plainly that a tell is evidence of a default, never proof that a model made the page.
- `SKILL.md` frontmatter follows the agentskills.io spec: `version` moved under `metadata`.
- README: install with `npx skills add`, the scanner, the optional hook, and how this skill relates to other anti-slop tools.

### Fixed

- The previous demo passed its own checks and landed in the clusters above. `examples/demo/AUDIT.md`, section 5, has the details.
- The catalog's C1 fix snippet used `#f4f1ea` with a terracotta accent, and T1 suggested Fraunces, which T2 lists as overused. Fix snippets now name roles instead of values.

## Earlier

Versions up to 0.2.0 and the unreleased cross-page consistency work are in the git history.
