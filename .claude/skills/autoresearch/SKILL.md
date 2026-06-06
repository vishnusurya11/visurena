---
name: autoresearch
description: >
  Use when the user wants you to actually go investigate something rather than answer off
  the top of your head — phrases like "research X", "figure out Y", "dig into Z", "improve
  the [skill] skill", "learn about W and report back", "find me the best library for…",
  "how do real teams do this?", "what's the modern way to…", or any question where the
  honest answer is "I'd need to look it up". Especially apt for project-development and
  UI/web research (libraries, APIs, design patterns, perf, a11y, animation, frameworks)
  on this Visurena codebase. The goal is depth and verifiability — go broad first, then
  deep on what matters, triangulate, and return something the user can actually act on.
  Do NOT use for tasks you can answer from current context alone or for one-line lookups.
---

# Autoresearch

Autonomous, deep, verifiable research. Keep going until you have something the user can use; don't stall on clarifying questions; flag your uncertainties; cite what you fetched.

## When this skill applies

- **Conceptual / domain questions** — "How does X work?", "What are the key ideas in Y?"
- **Project / UI / web investigations** — "Best way to implement view transitions in Next.js?", "Is `react-window` still the right virtualization choice?", "How do top streaming sites handle subtitle rendering?"
- **Library / framework / API research** — picking a tool, validating a claim from docs, checking version-current behavior
- **Skill improvement** — "Improve the parse-epub skill", "Make the autoresearch skill sharper"
- **Domain exploration** — "Map out the design system tokens landscape"

Don't use this for things you can answer from open files or a single grep — that's just being slow.

---

## Process

### Step 1 — Frame the goal

Be explicit (to yourself) about:
- What does "good enough" look like? (orientation, decision-ready recommendation, working improvement?)
- What's the **shape of the output**? (short answer, structured report, edited skill, code patch?)
- What context already exists in the conversation, the codebase, or prior skills?

If something is genuinely ambiguous, make the reasonable call and **state your assumption** rather than asking. Auto-mode default: keep going.

### Step 2 — Decompose into sub-questions

Generic "plan your research" is too loose. Use this template:

1. **List the sub-questions.** Five or fewer is usually right; more = scope is too broad.
2. **Order them by dependency** — you can't reason about #3 if #1 is unsettled.
3. **Sketch the expected source per sub-question** (spec? official docs? library README? perf case study?). If two sub-questions need the same source, batch them.
4. **Size each sub-question:**
   - *Quick lookup* — 1-3 tool calls, do inline.
   - *Investigation* — 5-10 tool calls, do inline if just one; **parallel-dispatch** if multiple are independent (see §"Parallel dispatch" below).
   - *Multi-source synthesis* — 10+ calls; almost always parallel-dispatch.

Vague delegation is the #1 failure mode of multi-step research — subagents duplicate each other's searches when scope isn't bounded. Anthropic's multi-agent research write-up (anthropic.com/engineering/multi-agent-research-system) found that explicit scope + expected-output format per sub-task is what makes parallelization actually work.

### Step 3 — Scratchpad your plan and interim findings

If research will span more than ~5 tool calls, write your plan and key findings down as you go — in a scratchpad block, a TodoWrite, or your working output. Context truncates under load; a plan that exists only in-context can vanish silently.

Anthropic's LeadResearcher explicitly persists plans to memory because "if the context window exceeds 200,000 tokens it will be truncated." Same principle here.

### Step 4 — Gather, with source-tier discipline

Go broad first, then deep on what's load-bearing. Triangulate anything the user will act on.

**The source quality ladder** (top wins ties):

1. **Authoritative** — the spec (W3C, WHATWG, ECMA, RFC), official docs at the canonical URL, the project's own GitHub README/changelog, primary research, the source code itself.
2. **Institutional secondary** — MDN, caniuse, web.dev / Chrome Developers, framework-team blogs, academic PDFs, central-bank/government explainers.
3. **Curated community** — Smashing Magazine, Hacker News top-comment discussion, well-known engineer blogs you can name, conference talks. *Signal, not ground truth.*
4. **SEO content** — listicles, AI-summary blogs, marketing posts. *Treat as leads, not facts.*

When two sources conflict, **prefer the higher tier — do not average them**. If both are tier 1, flag the conflict and report both positions. Without explicit tiering, agents will happily prefer SEO-optimized blogs over the actual spec (Anthropic's team documented this exact failure).

### Step 5 — Audit claims before synthesizing

Before you start drafting the answer, sort what you've gathered:

- **Verified** — the claim has at least one tier-1 source you actually fetched (not just a URL you remember).
- **Likely** — multiple independent tier-2/3 sources agree, no tier-1 confirms or contradicts.
- **Unverified** — single source, or you couldn't confirm despite trying.

This is the most-missed step. Hallucinations *compound*: an unconfirmed claim carried into synthesis becomes a confident-sounding finding ("propagation hallucinations" in the research literature). Tag the third tier in your output rather than smuggling it in.

### Step 6 — Synthesize: form a view, don't dump notes

- What are the 2-3 things that actually matter on this topic?
- What's the thing most explanations get wrong or skip?
- What are the practical implications for the user's specific situation (this React/Next.js project, this skill, this design call)?
- What trade-offs or live debates does the user need to know about?

Lead with the answer / mental model, then layer nuance. Don't make the reader assemble it.

### Step 7 — Verify URLs and produce output

**Before citing any URL, confirm you actually fetched it and got a real response.** Don't reproduce URLs from memory. Citation studies (arxiv: 2604.03173) find 3-13% of URLs in LLM research outputs are fabricated even with search enabled — the rate rises with citation volume.

For skill improvements, edit the skill files in place and summarize what changed and why — no need for the report template below.

---

## Stop conditions

Stop a **thread** when:
- Another round of search returns no new claims (just repeats what you have).
- You've spent 10+ tool calls on one sub-question with no payoff — drop it and flag as unresolved rather than chasing a source that may not exist.

Stop the **whole task** when:
- Another round wouldn't change your answer *or* your confidence.
- You've answered the user's actual goal at sufficient depth (not at maximum depth — re-anchor periodically).

> "Would another search change your conclusion?" If no, you're done.

Perplexity's deep research caps at 3-5 sequential searches per subtopic for the same reason. Anthropic's team flagged "scouring endlessly for nonexistent sources" as a real production failure.

---

## Parallel dispatch (for multi-part research)

When sub-questions are independent — different libraries, different sub-systems, different facts — spawn them as parallel sub-researchers rather than serializing. Anthropic measured ~90% performance lift over single-agent on multi-part research by parallelizing.

Each dispatched task must include:

1. **Specific objective** — the one question this sub-agent is answering.
2. **Expected output format** — bullet list of findings? a table? a recommendation?
3. **Tool guidance** — "WebSearch + WebFetch", "read these files", etc.
4. **Scope boundaries** — what *not* to research (prevents two agents both researching the same thing).
5. **Word/length cap** so the merged synthesis fits your context.

Then run a final synthesis pass on the merged results. **REQUIRED:** Use `superpowers:dispatching-parallel-agents` for the actual dispatch pattern.

Don't parallelize when sub-questions depend on each other or share state — that's how you get conflicting concurrent edits.

---

## UI / web research playbook

For project-development and UI/web tasks (the dominant use case in this repo), follow these source hierarchies — they cut research time in half because you skip the SEO sludge.

| You're researching | Reach first | Then | For sentiment only |
|---|---|---|---|
| **Web API / browser behavior** | MDN (the actual page, not a summary) | `caniuse.com` for support matrix; WHATWG/W3C spec for edge cases | — |
| **Animation library (Framer Motion, GSAP, etc.)** | Official docs + repo README | GitHub changelog (recent-version behavior); GitHub Issues for known limitations | Reddit / HN |
| **"Is this the modern UI pattern?"** | At least 2 of: web.dev, Smashing, the framework's own docs | Real production examples (Vercel, Linear, etc. open-sourced repos) | Twitter / Dribbble |
| **Performance** | web.dev / Core Web Vitals docs; Chrome DevTools docs | A real case study from an engineering blog (web.dev case studies, engineering.googleblog, framework team) | — |
| **Accessibility** | WCAG quick reference; APG (ARIA Authoring Practices) | axe-core docs; WebAIM | — |
| **React / Next.js / Tailwind / shadcn** | The project's own docs at the canonical URL, current major version | GitHub Discussions / Issues; release notes | YouTube tutorials |
| **A specific component pattern** | shadcn registry / Radix primitives | A handful of OSS apps that use it (sample 2-3, not 1) | Component galleries |

**Rules of thumb:**
- One blog saying "X is the modern approach" is not a finding. Triangulate.
- Browser-support claims are settled by `caniuse` + MDN compatibility tables, never by a blog.
- Version-current matters. If a library has shipped majors recently, check the changelog before quoting a doc page.
- For "best library" debates: read 2-3 actual repositories, look at maintenance signal (recent commits, open-issue ratio, release cadence), then look at sentiment.

---

## Output (default template)

Use this unless the goal calls for something different (e.g., skill edit, code patch).

```
## What I found: [topic]

**Bottom line**: [1-2 sentence answer or mental model]

**Verified claims** (tier-1 source, fetched):
- [claim] — [source URL]
- ...

**Likely** (corroborated across multiple secondary sources):
- [claim] — [sources]
- ...

**Uncertain / disputed**:
- [claim] — [why uncertain, or what the disagreement is]

**The thing most people miss**: [insight or nuance]

**For your situation**: [what to do, given the project/context]

**Methodology**: [N searches / M sources fetched; main paths followed; threads dropped]

**Go deeper**: [1-3 sources worth reading]
```

The methodology footnote isn't ceremony — it lets the user calibrate how much to trust the output. Production research products (Gemini, Perplexity) front-load this for the same reason.

For **skill improvements**: skip the template. Edit the skill files directly, then give a short changelog of what changed, why, and what's still uncertain.

---

## Worked examples

Three depths. Adapt the *shape*, not the literal steps.

### Short — "Improve the parse-epub skill"

1. Read existing `SKILL.md` and `scripts/parse_epub.py` fully — locate gaps (e.g., EPUB 2-only path, no real example output).
2. WebSearch for current EPUB spec version; confirm via canonical URL (W3C). Verify `ebooklib` is still the canonical lib and check its latest release.
3. WebFetch the lib docs to confirm the real API (don't quote from memory).
4. Diff: skill claims vs. actual current state. Concrete gap list.
5. Edit the skill in place; add references file for spec + lib links.
6. Hand off to **skill-creator** if changes are big enough to need re-evaluation; otherwise summarize the changelog.

### Medium — "What's the most reliable way to detect chapter boundaries in an arbitrary EPUB?"

1. Sub-questions: How is reading order defined? How are chapters marked in EPUB 2 vs 3? What's the authoritative structural source?
2. WebFetch W3C EPUB 3.3 spec for `nav.xhtml` / `epub:type`; check the EPUB 2 leftover (`toc.ncx`).
3. Sample 2-3 real implementations (ebooklib source, Calibre's logic). Note divergences.
4. Trade-off table: HTML-class heuristics (brittle) vs. spine + TOC (authoritative).
5. Output uses default template with confidence-tagged claims.

### Long — "How does money actually work?"

1. Dependency map of sub-questions: *what money is → how it's created → why it has value → what inflation is*. Can't explain (4) without (1-3).
2. **Parallel-dispatch** four sub-researchers, one per sub-question, with scope boundaries (each researches one tier of the question and returns 3-5 verified claims + 1-2 disputes).
3. Find primary sources for contested points (Bank of England's "Money creation in the modern economy" PDF for the credit-vs-commodity debate).
4. Synthesize a mental model that holds in one head, then layer nuance.
5. Surface the live debate explicitly rather than picking a side silently.

---

## Failure modes (and what to do)

| Mode | What to do |
|---|---|
| **Sources contradict** | Don't average. Identify *why* — version drift? different definitions? a genuine dispute? Prefer higher tier; if both tier-1, report both positions and the conflict explicitly. For browser/API conflicts, spec + caniuse resolve it — blog posts citing each other do not. |
| **Unresolved debate** | Frame the debate (the camps, what each gets right, what's at stake). Don't fake a verdict. |
| **Can't verify a key claim** | Say so explicitly and downgrade your confidence. A flagged unknown beats a confident guess. |
| **Rabbit-holing** | A thread that stops paying off is dropped, not pushed. Re-anchor: is this still serving the user's goal? |
| **Stale / hallucinated URL** | Don't cite a URL you haven't fetched. If unsure of a deep link, cite the docs root and flag it. URL fabrication rate rises with citation count — keep refs lean and verified. |
| **Premature synthesis** | Forming a view before you've gathered enough is how you're confidently wrong. Go broad before you commit. |
| **Subagents duplicating work** | Your sub-task scopes weren't tight enough — add explicit "do not research X, that's the other agent's job" boundaries when redispatching. |

---

## Methods playbook

For the deeper version of the methods summarized here — query craft, source triangulation, the parallel-dispatch template, when to stop — see `references/research-methods.md`. Load it on demand for multi-day or unfamiliar research; the body above is enough for routine work.

---

## Composing with other skills

- **Skill improvement** that requires changes you can't test inline → hand off to `skill-creator` (eval loop, benchmark, description optimization).
- **Code change** that needs to be test-driven → hand off to `superpowers:test-driven-development` after the research is done.
- **UI/design exploration** that turns into "what should we build" → after research, route to `frontend-design`, `modern-web-design`, `entertainment-platform-ui`, or `ui-ux-pro-max` for design execution.
- **Parallel sub-researcher dispatch** → use `superpowers:dispatching-parallel-agents` for the actual pattern.
