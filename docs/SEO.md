# SEO & discoverability

Maintainer notes for getting `avoid-ai-design` found. Copy-paste ready. Repo URL and author are filled in for funboy322.

For a deeper pass, the `ai-seo` skill covers AI-search/AEO optimization and `directory-submissions` covers the listing campaign.

---

## 1. GitHub repository metadata

The repo "About" blurb and topics are the single highest-impact SEO move for an open-source skill. Set them in the repo's right-hand sidebar.

**About (short, used in search results):**

> A Claude Code skill that audits AI-generated frontend and rewrites it to remove generic "AI slop" design patterns.

**About (longer alternate, if you prefer detail):**

> Audit and de-slop AI-generated UI. Detects and rewrites generic AI design patterns (purple gradients, Inter, centered heroes, default shadcn) in HTML/CSS and React/Tailwind. The design counterpart to avoid-ai-writing.

**Topics** (paste up to 20; all lowercase, hyphenated):

```
claude-code  claude-skill  agent-skills  agentskills  ai-slop  ai-design
frontend  frontend-design  ui-design  web-design  tailwindcss  shadcn-ui
react  design-system  llm  codex  cursor  ai-tools  anthropic  developer-tools
```

---

## 2. Keyword map

**Primary (own these):**
- `claude code skill`
- `avoid ai design`
- `remove ai slop`
- `de-slop ui`

**Secondary (work into headings and body):**
- ai-generated website looks generic
- make AI UI look less generic
- AI design patterns to avoid
- frontend design audit
- shadcn / Tailwind looks generic
- generic AI aesthetics

**Long-tail / question intent (the FAQ section targets these):**
- what is AI slop in design
- why do all AI websites look the same
- how to make AI-generated UI look less generic
- how to fix generic AI design

---

## 3. Page meta (for a docs site, GitHub Pages, or social cards)

**Title tag** (≤ 60 chars):

```
avoid-ai-design: Remove AI Slop From Frontend Code
```

**Meta description** (≤ 155 chars):

```
A Claude Code skill that audits AI-generated UI and rewrites it to remove generic "AI slop": purple gradients, Inter, centered heroes, default shadcn.
```

**Open Graph / Twitter Card:**

```html
<meta property="og:title" content="avoid-ai-design: Remove AI Slop From Frontend Code" />
<meta property="og:description" content="Audit and rewrite AI-generated UI so it stops looking AI-generated. A Claude Code skill for HTML/CSS and React/Tailwind/shadcn." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://github.com/funboy322/avoid-ai-design" />
<meta property="og:image" content="https://raw.githubusercontent.com/funboy322/avoid-ai-design/main/docs/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

**Social preview image** (`docs/og-image.png`, 1200×630): included in the repo. Upload it under **Settings → General → Social preview** so links to the repo unfurl with the card.

---

## 4. SKILL.md frontmatter (the most important SEO for the skill itself)

The `description` field is what makes Claude trigger the skill *and* what skill directories index. Keep it dense with the phrases users actually type. Recommended block for `SKILL.md`:

```yaml
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
```

---

## 5. Where to list it

Each listing is a backlink and a discovery surface. Rough order of effort vs. payoff:

- **agentskills.io**: the canonical SKILL.md registry. Submit here first.
- **GitHub topics**: set them (section 1); GitHub's own search and topic pages are real traffic.
- **awesome-claude-code** and **awesome-claude-skills** lists: open a PR adding your repo.
- **Claude Code plugin marketplaces** (the obra/superpowers ecosystem): package as a plugin later for one-command install.
- **Reddit**: r/ClaudeAI, r/cursor, r/ChatGPTCoding. Lead with the before/after, not the repo link.
- **X / Twitter**: post a before/after screenshot, tag #ClaudeCode #buildinpublic.
- **Hacker News**: "Show HN: A Claude skill that de-slops AI-generated UI".
- **Product Hunt**: optional, save for a polished v1 with a demo.

---

## 6. README keyword checklist

- [x] Primary keyword in the H1 and first sentence
- [x] Secondary keywords spread through section headings
- [x] Question-style FAQ headings for AEO (matches how people and AI search)
- [x] Keyword footer line
- [x] Repo URL and author filled in (funboy322)
- [x] Before/after screenshot embedded near the top of the README (`docs/before-after.png`)
- [x] Social preview image included (`docs/og-image.png`); upload via repo Settings
