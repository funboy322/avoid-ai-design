---
name: avoid-ai-design
description: Audit and rewrite frontend UI to remove generic AI design patterns ("AI slop"). Use this skill when asked to "de-slop a UI", "make a design look less AI-generated", "audit a component or page for AI design tells", or "fix Claude/Codex-generated frontend that looks generic". Covers HTML/CSS and React/Tailwind/shadcn. Supports a detection-only mode that flags patterns without rewriting.
version: 0.1.0
license: MIT
compatibility: Any AI coding assistant that supports the agentskills.io SKILL.md format (Claude Code, Cursor, VS Code Copilot, Codex CLI, etc.). No external tools or APIs required.
metadata:
  author: ungspirit
  tags: design ui frontend ai-slop tailwind shadcn react
  agentskills_spec: "1.0"
---

# Avoid AI Design: Audit & Rewrite

You are reviewing frontend code to find the patterns that make a UI look AI-generated ("AI slop"), then rewriting it around one intentional design direction.

This is the design counterpart to the `avoid-ai-writing` skill. It targets two stacks: plain **HTML/CSS/JS** and **React + Tailwind + shadcn/ui**.

The point is not to chase novelty. It is to replace defaults with decisions. A purple gradient is not bad because purple is bad; it is bad because no one chose it. Every fix below trades a reflex for an intention.

## Modes

**`rewrite`** (default): Audit the code, commit to a direction, then rewrite it.

**`detect`**: Audit and score only. No edits. Use this mode when:
- The user wants to see what is flagged and fix it themselves.
- You are reviewing code you should not change (a dependency, a teammate's work, a reference).
- The user asks for a quick scan.

Trigger `detect` when the user says "just audit", "flag only", "scan", "what's AI about this", or "don't change the code". Default to `rewrite`.

## Workflow (rewrite mode)

1. **Scope.** Read the actual files first. Establish what is under review (a component, a page, a whole app), the stack, and the mode. Never judge from the prompt alone.
2. **Audit.** Walk every category in `references/ai-tells-catalog.md`. For each tell you find, report its location, category, severity (P0/P1/P2), and one line on *why it reads as AI*.
3. **Commit to a direction.** Read `references/aesthetic-directions.md`. Based on the artifact's purpose and audience, pick **one** direction and name it with three to five concrete moves: a type pairing, a palette stance, a layout stance, a motion idea, and one signature detail. Present it for confirmation, with one or two alternatives in a sentence. Wait for the user before you change code.
4. **Calibrate depth.** A small component, or anything inside an existing design system, gets a **surgical** pass: swap the tells, keep the structure and the tokens. A standalone page, landing page, or artifact gets a **rebuild** around the chosen direction.
5. **Rewrite.** Edit the real files. Preserve functionality, props, state, routing, data flow, accessibility, and the meaning of the copy. Do not add dependencies silently; name any you introduce.
6. **Re-audit.** Run the catalog over the result and report what survived. Target zero P0 tells.

## Severity tiers

Triage by how loudly a pattern announces "a machine made this".

- **P0: screams AI on sight.** The purple-to-blue gradient, Inter or the system stack for everything, the centered hero with three feature cards, an untouched shadcn `zinc`/`slate` palette, glassmorphism by reflex.
- **P1: obvious AI smell.** `rounded-2xl shadow-lg` on every surface, an icon sitting in a rounded square, emoji used as feature bullets, default Tailwind `blue-600` buttons, "Elevate your workflow" copy.
- **P2: cosmetic.** Flat uniform spacing with no hierarchy, no motion at all, or the same `fade-in-up` on every element.

Quick passes fix P0 and P1. A full audit covers all three.

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

When the code is *about* AI design patterns (a demo, a teaching example, a "what not to do" gallery, or this skill's own docs), illustrative slop is intentional. Do not rewrite examples that are explicitly marked as bad-on-purpose. Flag only patterns in the real interface.

## Output format

### rewrite mode

1. **Audit.** Every tell found, grouped by severity, each with its location and a one-line reason.
2. **Direction.** The single direction you are committing to, with its defining moves, plus one or two alternatives named in a sentence. (Confirm before continuing.)
3. **Rewrite.** The edited code, at the calibrated depth.
4. **What changed.** A short summary of the meaningful moves, not a line-by-line diff.
5. **Re-audit.** A second pass over your own output. Note any tell that survived and fix it, or confirm the result is clean.

### detect mode

1. **Audit.** Every tell found, grouped by severity (P0/P1/P2), with locations.
2. **Assessment.** For each flag, whether it is a clear problem or a judgment call. Some patterns are fine in context (one gradient, used well, is not slop). Say which to fix and which to leave.

## Don't over-design

The goal is a UI that looks like a person with taste made it, not a UI that is loud for its own sake. Restraint executed well beats maximalism applied blindly. If the original is already strong, make the few cuts it needs and stop. Match the intensity of the rewrite to the artifact: a settings panel does not need a hero animation.
