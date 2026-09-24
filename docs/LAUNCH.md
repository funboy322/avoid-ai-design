# Launch kit: avoid-ai-design

The plan for GitHub stars. The engine is a Hacker News "Show HN", a Reddit post, and an X thread, all pointing at a repo whose catalog is useful on its own. Stars follow usefulness, not hype.

Every piece of copy below was run through the `avoid-ai-writing` skill: zero em-dashes, no Tier-1/2 AI vocabulary, varied rhythm. Fitting, since the project is about removing AI tells.

The repo URL (https://github.com/funboy322/avoid-ai-design) is already filled into every post below.

---

## Where to publish (ordered by payoff for stars)

| # | Channel | Why it earns stars | Effort | Timing |
|---|---|---|---|---|
| 1 | **Hacker News (Show HN)** | Highest variance, highest ceiling for dev tools. One front-page hour can mean hundreds of stars. | Low | Tue–Thu, ~8–10am ET |
| 2 | **Reddit r/ClaudeAI** | The most on-target audience. They use Claude Code daily. | Low | Weekday morning |
| 3 | **X / Twitter thread** | Shareable before/after. Tag the people already complaining about AI slop. | Low | Tue–Thu, 9am–noon ET |
| 4 | **awesome-claude-code list (PR)** | A durable backlink and a steady discovery source. Stars trickle in for months. | Medium | Anytime |
| 5 | **agentskills.io registry** | The canonical SKILL.md directory. | Low | Anytime |
| 6 | **Reddit r/webdev + r/SideProject** | Wider dev audience; r/SideProject is friendly to launches. | Low | After r/ClaudeAI |
| 7 | **LinkedIn** | Reaches people who do not live on HN. | Low | Tue–Thu morning |
| 8 | **Dev.to / Hashnode cross-post** | A short "why every AI site looks the same" article that links the repo ranks over time. | Medium | Week 2 |
| 9 | **Discord (Anthropic, Cursor, indie hackers)** | Direct, warm audiences. Share, do not spam. | Low | Launch day |
| 10 | **Product Hunt** | Save for a polished moment with a demo GIF. Drives a spike, not durable stars. | High | Later |

**Reality check on stars.** Most come from (1) a Show HN that lands, (2) a thread someone influential reposts, and (3) sitting on an awesome-list. The repo has to deliver in the first ten seconds: a sharp README, a before/after image, and a catalog people want to screenshot. Build that first, then post.

---

## v0.4 update (September 2026)

The story for this round is a self-own: my own scanner caught my own demo. The v0.3 "after" swapped the purple gradient for warm paper, a vermilion accent, Helvetica, all-caps labels, and one colored headline word, and Anthropic's `frontend-design` skill lists every piece of that as an AI default. v0.4 adds a zero-dependency scanner, checks the second-order defaults by name, and rebuilds the demo from the product. Lead with the self-own; it is the most shareable fact in the release.

GitHub release: https://github.com/funboy322/avoid-ai-design/releases/tag/v0.4.0

Like the rest of this kit, every post below went through the `avoid-ai-writing` skill: no em dashes, no Tier-1 vocabulary, varied rhythm, facts checked against the repo.

### LinkedIn (attach `docs/variants.png`)

```
My own design tool just caught me making AI slop.

This summer I shipped a skill that turns generic AI landing pages into something that looks designed. The demo went from a purple gradient to warm paper, a vermilion accent, Helvetica, small all-caps labels, and one colored word in the headline. It looked tasteful. People liked it.

Then Anthropic's own frontend-design skill listed the looks AI-generated design clusters around right now. Cream with a terracotta accent. Near-black with one acid-green highlight. Tiny all-caps labels over every heading. One colored word in the headline. Numbers like 01, 02, 03 on things that aren't steps.

That was my demo, almost line for line.

So v0.4 of avoid-ai-design checks for those by name. It ships a scanner with zero dependencies that reads your code and flags 50 patterns like these. I ran it on my own demo first. It flagged every "after" I had made.

I rebuilt all four. This time each design starts from the product instead of from a style: one from its retention chart, one from its name, one from the office TV it will end up on, one from the question every user asks. The scanner finds no design tells in any of them.

The lesson I keep relearning: "less AI" is a moving target. The fix becomes the next default the moment everyone reaches for it.

Free, MIT, the design counterpart to avoid-ai-writing, and it works on output from any model. Link in the comments. ⭐
```

**First comment** (the link goes here, not in the post):

```
Repo, free and MIT: https://github.com/funboy322/avoid-ai-design
How the old demo failed, in detail: https://github.com/funboy322/avoid-ai-design/blob/main/examples/demo/AUDIT.md
```

### X: single post (attach `docs/before-after.png`)

```
My own anti-slop tool caught me.

My "fixed" demo: warm paper, a vermilion accent, all-caps labels, one colored word in the headline. Anthropic's frontend-design skill lists every piece of that as an AI default.

v0.4 checks for them by name. Free, MIT:
github.com/funboy322/avoid-ai-design
```

### X: thread (attach `docs/variants.png` to 5/)

```
1/ I built a skill that makes AI-generated UI look less AI.

Then I wrote a scanner for it, ran it on my own demo, and it flagged every "after" I had made. 🧵
```
```
2/ The first "after" swapped the purple gradient for warm paper, a vermilion accent, Helvetica, tiny all-caps labels, and one colored word in the headline.

It looked tasteful. It was also the current AI default.
```
```
3/ Anthropic's own frontend-design skill lists the looks AI design clusters around right now:

· cream + terracotta
· near-black + one acid-green accent
· newspaper hairlines, zero radius
· the rounded-card kit
· all-caps eyebrows, mono labels, → on every link
```
```
4/ v0.4 checks for all of them by name, plus 17 more tells: fonts declared but never loaded, stock Aceternity effects, motion that ignores reduced-motion.

The scanner has zero dependencies and exits non-zero on P0/P1, so it can gate CI:

node scripts/detect.mjs src/
```
```
5/ Then I rebuilt the demo starting from the product, not a style.

Same analytics page, four answers: its retention chart, its name (cadence = rhythm), the office TV it ends up on, the funnel its users ask about.

The scanner finds no design tells in any of them.
```
```
6/ npx skills add funboy322/avoid-ai-design

Free, MIT, and it works on Claude, Codex, and Cursor output. How my own demo failed, in detail:
github.com/funboy322/avoid-ai-design
```

### v0.4 checklist

- [x] GitHub release v0.4.0 with notes and images
- [x] Repo About text and topics updated (see `docs/SEO.md`)
- [ ] Upload the new `docs/og-image.png` under Settings > General > Social preview (the API cannot set it)
- [ ] LinkedIn: post Tue-Thu morning ET, link in the first comment, answer every comment in the first two hours
- [ ] X: post the thread, pin it for the week, and reply to "AI slop" threads with the before/after image

---

## Launch copy (v0.2, June 2026)

### X / Twitter: single post

```
Every AI-built site looks the same. Purple gradient, Inter, a centered hero, three rounded cards.

I built a Claude Code skill that reads AI-generated frontend, flags the tells, and rewrites them with a real point of view.

The design version of avoid-ai-writing. Free, MIT.

https://github.com/funboy322/avoid-ai-design ⭐
```

### X / Twitter: thread (6 posts)

```
1/ Every website an AI builds looks the same:

· purple-to-blue gradient
· Inter font
· centered hero, pill badge, three feature cards
· glass nav, rounded-2xl on everything

Once you see it, you can't unsee it. So I built a skill that fixes it. 🧵
```
```
2/ Why does it happen?

Models train on a decade of Tailwind tutorials and shadcn starters. They don't pick indigo. Indigo is the average.

Tailwind UI shipped buttons as bg-indigo-500 years ago. The whole web learned from it. Adam Wathan even owned it last year.
```
```
3/ avoid-ai-design is a Claude Code skill with two modes.

detect: it audits your UI and flags every tell, by severity.
rewrite: it commits to one real design direction and rewrites the code, without breaking your props, state, or accessibility.
```
```
4/ The core is a catalog of the tells, each with a fix for plain HTML/CSS and for React/Tailwind/shadcn.

A line from the research behind it that stuck with me:

"Colored left borders are almost as reliable a sign of AI design as em-dashes are for text."
```
```
5/ It works on output from any model, not just Claude. Codex, Cursor, v0, whatever shipped the slop.

No dependencies. No API keys. One SKILL.md and two reference files. MIT.
```
```
6/ Drop it straight into Claude Code:

git clone https://github.com/funboy322/avoid-ai-design ~/.claude/skills/avoid-ai-design

Then ask: "de-slop this page."

Repo and the full catalog: https://github.com/funboy322/avoid-ai-design

If it spares you one more purple gradient, star it. ⭐
```

### Reddit: r/ClaudeAI (primary)

**Title:** I catalogued every way AI-generated UI gives itself away, then made a Claude skill that fixes them

**Body:**
```
You can spot an AI-built site in a second. Purple-to-blue gradient, Inter, a centered hero with a pill badge, three identical feature cards, glass nav, everything at the same rounded corner.

It's not a taste problem. Nobody chose any of it. Models fall back to the median of what they trained on, which is ten years of Tailwind tutorials. Tailwind UI defaulted its buttons to bg-indigo-500 a while back, and that one choice seeded most of the "AI purple" you see today.

A recent analysis of ~1,400 Show HN sites put numbers on it: about 23% shipped untouched shadcn defaults, ~20% had the three-card feature grid, ~10% used indigo or violet buttons.

I got tired of fixing the same things by hand, so I built a Claude Code skill called avoid-ai-design. Two modes: detect reads your UI and flags every tell with a severity; rewrite picks one real design direction and rewrites the code while keeping your props, state, routing, and accessibility intact. The heart of it is a catalog: each tell, why it reads as AI, and a fix for both plain HTML/CSS and React/Tailwind/shadcn. There's a second file with a dozen design directions to commit to instead of defaulting.

It's the design counterpart to the avoid-ai-writing skill. Works on output from any model (Claude, Codex, Cursor, v0). No dependencies, MIT.

Repo and the full catalog: https://github.com/funboy322/avoid-ai-design

Curious which tells you'd add. The catalog takes PRs.
```

### Reddit: r/ClaudeAI Showcase Megathread comment

New accounts cannot make standalone Showcase posts (the sub has a minimum-karma rule; the mod bot removes them and points to the megathread). The project still qualifies for the **Build with Claude Project Showcase Megathread**, where a comment is welcome and image links are allowed. Paste this as a comment there:

```
**avoid-ai-design** is a Claude Code skill that audits AI-generated frontend and rewrites it so it stops looking AI-generated.

You can spot an AI-built page in a second: purple-to-blue gradient, Inter, a centered hero with three feature cards, untouched shadcn. The skill reads the code, flags each tell by severity, then rewrites the UI around one committed design direction without breaking your props, state, or accessibility. Two modes: detect (audit only) and rewrite. It ships a catalog of the tells with a fix for each in HTML/CSS and React/Tailwind/shadcn.

Same content, real before/after (both pages live in the repo):
https://raw.githubusercontent.com/funboy322/avoid-ai-design/main/docs/before-after.png

Repo, MIT: https://github.com/funboy322/avoid-ai-design

It's the design counterpart to avoid-ai-writing. I built it because I kept fixing the same five things by hand. Curious which tells you'd add.
```

### Hacker News: Show HN

**Title:** Show HN: A Claude skill that de-slops AI-generated UI

**Body:**
```
Every AI tool builds the same website: purple gradient, Inter, centered hero, three feature cards, untouched shadcn. A recent analysis of ~1,400 Show HN sites quantified it, and the cause is mundane: models fall back to the median of their training data, and Tailwind UI's old bg-indigo-500 default seeded most of the "AI purple."

avoid-ai-design is a Claude Code skill (a plain SKILL.md, no deps) that audits frontend code for these patterns and rewrites it around one committed design direction. Two modes: detect (flag only, with severity) and rewrite (audit, pick a direction, edit the files without breaking props/state/a11y). It ships a catalog of tells with fixes for HTML/CSS and React/Tailwind/shadcn, plus a set of design directions to choose from.

It's the design counterpart to avoid-ai-writing, and it works on any model's output, not just Claude's.

Repo: https://github.com/funboy322/avoid-ai-design

The catalog is the interesting part, and it takes PRs. I'd like to hear which tells you'd add or push back on.
```

### LinkedIn

```
You can recognize an AI-built website in about a second.

The purple-to-blue gradient. Inter everywhere. A centered hero with a little pill badge, then three identical feature cards. A glass navbar. Every corner at the same radius.

None of it is wrong, exactly. The problem is that nobody chose it. Models fall back to the average of what they trained on, and a decade of Tailwind tutorials made indigo the average.

So I built a Claude Code skill, avoid-ai-design. It audits frontend code and flags each of these tells by severity. Then, if you want, it picks one real design direction and rewrites the code, without touching your functionality or accessibility.

It's the design counterpart to the avoid-ai-writing skill. Free, MIT, and it works on output from any model.

If you build with AI, read the catalog. Link in the comments. ⭐
```

### Product Hunt

**Tagline (≤60 chars):** Make AI-generated UI stop looking AI-generated

**Description:**
```
Every AI tool ships the same page: purple gradient, Inter, centered hero, three cards. avoid-ai-design is a Claude Code skill that audits your frontend for these tells and rewrites them around one real design direction. Works on HTML/CSS and React/Tailwind/shadcn, with output from any model. Free and MIT.
```

**First maker comment:**
```
I kept fixing the same five things in every AI-built page, so I wrote them down. It grew into a catalog of design tells with a fix for each, plus a skill that applies them. The catalog is free to read even if you never install the skill. Would love to know which tells you'd add.
```

---

## Launch-day checklist

- [x] README has a before/after image near the top (the single biggest conversion lever)
- [x] Repo description and topics set (see `docs/SEO.md`)
- [x] Repo URL filled into every post and the README clone command
- [ ] Upload `docs/og-image.png` as the GitHub Social preview (Settings > General)
- [ ] Post the Show HN first; do not ask for upvotes (against the rules), just reply to every comment fast
- [ ] Post the X thread; reply to existing "AI slop" threads with the catalog link
- [ ] Post to r/ClaudeAI; answer questions in the comments
- [ ] Open the awesome-claude-code PR
- [ ] Submit to agentskills.io
- [ ] Pin the thread, add the repo to your X bio for the week

## Assets

- **Before/after image.** Done: `docs/before-after.png`, embedded at the top of the README. The asset that earns shares.
- **Social preview (1200×630).** Done: `docs/og-image.png`. Still needs uploading under repo Settings > General > Social preview so repo links unfurl with it.
- **Demo GIF** (for Product Hunt later): still needed. The skill auditing a page and rewriting it.
- **v0.4 images.** `docs/variants.png` (one page, four directions drawn from the product) and `docs/consistency.png` (one system across pages) are new. All images were re-rendered for v0.4 from the `_*.html` scaffolds in `examples/demo/`, so they show the rebuilt demo.

## What earns stars (and what doesn't)

- A catalog people screenshot earns stars. Vague claims do not.
- Replying to every comment in the first two hours earns stars. Posting and leaving does not.
- "Works on Codex and Cursor too, not just Claude" widens the audience. Keep it in.
- Never buy stars or ask for upvotes. It gets repos flagged and is easy to spot.
