---
name: avoid-ai-design
description: Audit and rewrite frontend UI to remove generic AI design patterns ("AI slop"). Use this skill when asked to "de-slop a UI", "make a design look less AI-generated", "audit a component or page for AI design tells", or "fix Claude/Codex-generated frontend that looks generic". Covers HTML/CSS and React/Tailwind/shadcn. Supports a detection-only mode that flags patterns without rewriting.
version: 0.2.0
license: MIT
compatibility: Any AI coding assistant that supports the agentskills.io SKILL.md format (Claude Code, Cursor, VS Code Copilot, Codex CLI, etc.). No external tools or APIs required; uses a screenshot tool if one is available.
metadata:
  author: ungspirit
  tags: design ui frontend ai-slop tailwind shadcn react
  agentskills_spec: "1.0"
---

# Avoid AI Design: Audit & Rewrite

You are reviewing frontend code to find the patterns that make a UI look AI-generated ("AI slop"), then rewriting it around one intentional design direction.

This is the design counterpart to the `avoid-ai-writing` skill. It targets two stacks: plain **HTML/CSS/JS** and **React + Tailwind + shadcn/ui**.

The point is not to chase novelty. It is to replace defaults with decisions. A purple gradient is not bad because purple is bad; it is bad because no one chose it. Every fix below trades a reflex for an intention.

**Code shows half of it; pixels show the rest.** Some tells live in the source (a literal `from-indigo-500`, `Inter`, a `lucide` import). Others are visual and cannot be read off the source with confidence: whether a palette has a real dominant color, whether spacing has rhythm, whether the hierarchy reads. So render the UI when you can (step 2). When you cannot, say which findings are code-certain and which are inferred.

## Modes

**`rewrite`** (default): Audit the code, commit to a direction, then rewrite it.

**`detect`**: Audit and score only. No edits. Use this mode when:
- The user wants to see what is flagged and fix it themselves.
- You are reviewing code you should not change (a dependency, a teammate's work, a reference).
- The user asks for a quick scan.

Trigger `detect` when the user says "just audit", "flag only", "scan", "what's AI about this", or "don't change the code". Default to `rewrite`.

## Workflow (rewrite mode)

1. **Scope.** Read the actual files first. Establish what is under review (a component, a page, a whole app), the stack, and the mode. Never judge from the prompt alone.
2. **Render if you can.** Design is visual. If a screenshot or preview tool is available (a browser or preview MCP, a headless renderer, a dev server you can capture), render the artifact and judge the visual tells from pixels: palette dominance, spacing rhythm, visual hierarchy, motion. Read the source too, for the code-level tells. If nothing can render it, audit the source alone and mark the visual tells as **inferred, lower-confidence** rather than asserting them.
3. **Audit.** Walk every category in `references/ai-tells-catalog.md`. For each tell, report its location, category, severity (P0/P1/P2), and one line on *why it reads as AI*. Note which findings are code-certain and which came from the render (or are inferred without one).
4. **Commit to a direction.** Read `references/aesthetic-directions.md`. Pick **one** direction for the artifact and name it with three to five concrete moves: a type pairing, a palette stance, a layout stance, a motion idea, and one signature detail. If a user is present, show the direction plus one or two alternatives in a sentence and pause before changing code. If you are running non-interactively or as a sub-task of another skill, choose the best fit, state the assumption in one line, proceed, and keep it easy to override.
5. **Calibrate depth.** A small component, or anything inside a design system, gets a **surgical** pass: swap the tells, keep the structure and the tokens. A standalone page or artifact gets a **rebuild** around the direction. A full rebuild overlaps with the `frontend-design` skill; if it is available and the work is ground-up, hand it the committed direction rather than duplicating its job here.
6. **Rewrite.** Edit the real files. Preserve functionality, props, state, routing, data flow, accessibility, and the meaning of the copy. Do not add dependencies silently; name any you introduce.
7. **Re-audit and judge.** Run the catalog over the result. A clean catalog pass (no P0) is **necessary but not sufficient** (see "What success means").

## What success means

"Less obviously AI" is not the goal. A token-swap (indigo to teal, Inter to Fraunces, drop the emoji) clears every P0 and still leaves a forgettable template. Judge the result against three tests:

1. **Justified.** Every change serves the committed direction, not a different reflex.
2. **Coherent.** The type pairing, palette stance, layout, and signature detail reinforce one another. One committed idea, executed.
3. **Not a re-run.** You did not reach for the same "safe" default as recent passes. If this looks like the last de-slop you did (the warm-paper-serif move, one stock accent), it failed the second-order-default check. Vary deliberately.

A page can pass the catalog and still fail all three. The catalog catches clichés; these tests catch mediocrity.

## Severity tiers

Tiers triage by **who notices**, not by how much the pattern annoys you. Context can move a tell up or down.

- **P0, a layperson recognizes it as AI-made.** The purple-to-blue gradient, Inter for everything, an untouched shadcn base theme, gradient (`bg-clip-text`) headline text, reflexive glassmorphism. These are the memes.
- **P1, a designer or developer recognizes it.** `rounded-2xl shadow-lg` on every surface, the default page shell (`container mx-auto px-4`, `max-w-7xl`), icon-in-a-rounded-square, the default four-column footer, dead hover/focus states, default-blue or indigo buttons, "Elevate your workflow" copy.
- **P2, craft and polish gaps.** Flat spacing with no rhythm, no motion, or the same `fade-in-up` on everything.

Context matters: a centered hero is P0 on a generic SaaS page and fine in a luxury layout. Missing `:focus-visible` is also an accessibility defect, so treat it as high priority whatever its tier.

## Context profiles

Adjust strictness to where the UI lives. Auto-detect from the stack and structure; state which profile you are using.

| Profile | How to treat it |
|---|---|
| `landing` / `artifact` | Full strength. Reward boldness. This is where a real direction matters most. |
| `marketing-page` | Full strength on type, color, layout, and copy. |
| `app-component` | Surgical. Fix the tells, keep the component's contract and structure. |
| `inside-design-system` | Surgical only. Respect existing tokens and primitives. Do not fight the system; flag system-level tells separately as advice. |
| `dashboard` | Favor density, legibility, and information hierarchy over decoration. |

## Guardrails

- **Never break working code.** Props, state, routing, data fetching, and accessibility survive intact. Behavior is not yours to change.
- **Do not trade one cliché for another.** The "Space Grotesk trap": models reach for the same "tasteful" non-default every time (Space Grotesk, a slate palette, one stock gradient). A second-order default is still a default. Vary your choices across runs and justify them by context.
- **Respect hard constraints.** An existing design system, brand guidelines, or a named framework outranks your taste. Work within them.
- **Do not manufacture problems.** If the UI is already distinctive and intentional, say so and stop. A clean audit is a valid result.
- **Keep the copy's meaning.** You may sharpen generic microcopy, but do not invent claims or change what the product says about itself.

## Self-reference escape hatch

When the code is *about* AI design patterns (a demo, a teaching example, a "what not to do" gallery, or this skill's own docs), illustrative slop is intentional. Treat it as exempt only when there is a concrete signal: a sibling comment that marks it (e.g. `slop-example`), a path under `examples/`, `fixtures/`, `__mocks__/`, or `stories/`, or text explicitly labeled illustrative. Flag patterns in the real interface only.

## Beyond HTML and React

The catalog is written for HTML/CSS and React/Tailwind/shadcn because that is what AI tools emit most. The principle is framework-agnostic: a default left untouched is the tell. Untouched MUI (Roboto and blue), Chakra, Bootstrap (`btn-primary` blue), or Mantine defaults read as AI for the same reason. Apply the same audit, swapping the specific class and token names.

## Output format

### rewrite mode

1. **Audit.** Every tell found, grouped by severity, each with its location, a one-line reason, and a code-certain / inferred tag.
2. **Direction.** The single direction you are committing to, with its defining moves, plus one or two alternatives in a sentence. If interactive, this is where you pause.
3. **Rewrite.** The edited code, at the calibrated depth.
4. **What changed.** A short summary of the meaningful moves, not a line-by-line diff.
5. **Re-audit and judgment.** A second pass over your own output: confirm no P0 survived, then judge it against the three success tests. Fix anything that fails.

### detect mode

1. **Audit.** Every tell found, grouped by severity (P0/P1/P2), with locations and a code-certain / inferred tag.
2. **Assessment.** For each flag, whether it is a clear problem or a judgment call. Some patterns are fine in context (one gradient, used well, is not slop). Say which to fix and which to leave.

## Don't over-design

The goal is a UI that looks like a person with taste made it, not a UI that is loud for its own sake. Restraint executed well beats maximalism applied blindly. If the original is already strong, make the few cuts it needs and stop. Match the intensity of the rewrite to the artifact: a settings panel does not need a hero animation.
