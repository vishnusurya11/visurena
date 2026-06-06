# Research Methods Playbook

The deeper reference for the methods summarized in SKILL.md. Read this when you want to research *well*, not just fast — long investigations, unfamiliar territory, or anything you're about to ship a decision on.

## Table of contents

1. Web search craft
2. Official docs & specifications
3. Primary sources
4. Repository & codebase exploration
5. The source quality ladder (deeper)
6. Triangulation & confidence calibration
7. The parallel-dispatch template
8. The scratchpad discipline
9. URL verification & citation hygiene
10. Mechanical stop conditions
11. Synthesis: form a view

---

## 1. Web search craft

**Goal:** orient quickly and find the doors to better sources. Web search is rarely the *final* source — it's how you find the authoritative one.

- **Craft specific queries.** Generic queries return generic content. Include version numbers, exact error strings, proper nouns, dates ("2026"), and the specific sub-question. Iterate: your second query should be smarter because of what the first returned.
- **Read the result set, not just result #1.** Scan titles/domains for the authoritative source (official docs, standards body, the project's own repo) before clicking a random blog.
- **Use domain filters** (`site:` operators) when you know you want primary sources (`site:developer.mozilla.org`, `site:web.dev`, `site:github.com`).
- **Date awareness.** Tech moves fast. A 2022 answer about "the latest version" is probably wrong now. Always sanity-check recency for anything version- or trend-sensitive.

## 2. Official docs & specifications

**Goal:** the authoritative "how it actually works."

- Go to the canonical URL (the project's own docs domain, the standards body). Confirm you're on the **current version** — versioned doc sites silently serve old pages.
- For specs (W3C, WHATWG, IETF, ECMA), the spec text is ground truth even when it's dense. Skim for the section you need; don't try to read it cover-to-cover.
- **Always actually fetch the page before citing it.** Never reproduce a URL from memory as if you'd verified it.

## 3. Primary sources

**Goal:** for anything contested or load-bearing, cut out the middleman.

- Research papers, original announcements, standards documents, central-bank/government explainers, the actual source code.
- Secondary sources (blogs, summaries, even good ones) introduce drift and sometimes outright errors. For a claim the user will *act on*, trace it back to where it originated.
- When a "fact" everyone repeats sounds too clean, check the primary source — popular summaries often flatten nuance or propagate a misreading.

## 4. Repository / codebase exploration

**Goal:** answer "how does this actually work here" (your codebase) or "how do real implementations do it" (OSS).

- For *this* project: `Grep`/`Glob` to locate, `Read` to understand. Code is ground truth; comments and docs can be stale or aspirational.
- For OSS: use `gh` (issues, PRs, code search) and WebFetch on raw file URLs. Read the README and a couple of real call sites, not just the API surface.
- **Sample more than one implementation.** One library's design decision is an example, not a consensus. Check 2–3 to distinguish "the standard way" from "one team's choice."

## 5. The source quality ladder (deeper)

| Tier | What it is | Treat as |
|---|---|---|
| 1 — Authoritative | The spec; official docs at canonical URL; the project's own README/changelog; primary research; the source code | Ground truth, verify only the version/recency |
| 2 — Institutional secondary | MDN, caniuse, web.dev / Chrome Developers, framework-team blogs, peer-reviewed papers, central-bank/gov explainers | Reliable for synthesis; confirm with tier 1 for load-bearing claims |
| 3 — Curated community | Smashing Magazine, HN top comments, well-known engineer blogs, conference talks (recorded) | Signal, not ground truth. Useful for "is this the prevailing view?" |
| 4 — SEO content | Listicles, AI-generated summaries, marketing posts, content farms | Leads only. Never the citation. |

**Operational rules:**
- When two sources conflict, **prefer the higher tier**. Don't average. If both are tier 1, flag the conflict and report both positions.
- For browser/API/web-platform claims, tier 1 = MDN compat table + spec + caniuse. Tier 4 blog posts citing each other do not constitute evidence.
- For "is this still the modern pattern?" questions, you need at least two tier 2-3 sources from independent authors agreeing — one Smashing post is a lead, not a finding.
- For version-sensitive claims (library APIs, framework patterns, browser features), confirm the source is current-version. Versioned doc sites silently serve old pages and old blog posts are everywhere.

## 6. Triangulation & confidence calibration

The single most important discipline.

- **One source = a lead. Two independent sources = a finding.** Independent means they didn't both copy the same upstream claim.
- Assign confidence honestly — and carry it into the output:
  - *Verified* — at least one tier-1 source you actually fetched
  - *Likely* — multiple tier-2/3 sources agree, no tier-1 confirms/contradicts
  - *Unverified* — single source, or you couldn't confirm despite trying
- Authoritative + recent beats popular + old. A high-traffic blog post does not outrank the official spec.
- Smuggling tier 3-4 claims into a confidently-worded synthesis is the #1 way deep research goes wrong. Tag them.

## 7. The parallel-dispatch template

For multi-part research where sub-questions are independent, dispatch sub-researchers in parallel. **REQUIRED:** Use `superpowers:dispatching-parallel-agents` for the underlying dispatch pattern. This section covers what to put in each sub-agent's prompt.

Each sub-task prompt should contain, in order:

1. **One-line objective** — the single question this agent is answering.
2. **Why we're asking** — half a sentence of context so the agent can make judgment calls.
3. **Expected output format** — "Return 3-5 verified claims (with source URLs) + 1-2 disputes/unknowns. Under 400 words." Be specific.
4. **Tool guidance** — "Use WebSearch + WebFetch; for any cited URL, fetch it. No quoting from memory."
5. **Scope boundaries** — what *not* to research (this is what stops two sub-agents duplicating each other).
6. **Stop conditions** — "Stop when results repeat. Cap at ~10 tool calls. If you hit a dead end, flag it rather than chasing."

After all sub-agents return, run a **synthesis pass** in your own context: merge the findings, resolve cross-agent conflicts, and write the user-facing output. Don't let one sub-agent's framing dominate.

When NOT to parallelize: sub-questions that depend on each other (you need #1's answer to ask #2 well), shared state (both editing the same file), or when scope is small enough that the dispatch overhead exceeds the speedup.

## 8. The scratchpad discipline

If research will span more than ~5 tool calls, **write your plan and key interim findings down**. Options, in order of preference:

- A `TodoWrite` plan keeps sub-tasks visible across context compaction.
- A scratchpad block in your output that you append to as you go.
- A working-draft file (`/tmp/research-notes.md`) for very long investigations.

Context truncates under load. Plans that live only in-context can vanish silently. Anthropic's LeadResearcher explicitly persists its plan to memory because "if the context window exceeds 200,000 tokens it will be truncated." Same principle here.

## 9. URL verification & citation hygiene

- **Never cite a URL you haven't fetched in this session.** Memory of a URL is not a citation.
- Before including any URL in the output, confirm you got a real response (not a 403, 404, or paywall redirect).
- For deep links into long docs, prefer linking the docs root + a fragment/section name over a deep slug that might rot.
- Keep citation count lean — citation hallucination rate rises with volume. Five rock-solid citations beat fifteen weak ones.
- Cite *where the claim came from*, not just "a doc somewhere." `[MDN: Fetch API: signal option](url)` not `[MDN](url)`.

## 10. Mechanical stop conditions

Beyond the qualitative "would a smart friend be satisfied?" heuristic, use these:

- **No-new-claims rule:** stop a thread when another search round returns nothing you don't already have.
- **10-call cap per sub-question:** if you've spent ~10 tool calls on one narrow sub-question with no payoff, drop it. Flag it as unresolvable rather than chasing a source that may not exist.
- **No-confidence-change rule:** stop the whole task when another search wouldn't change your answer *or* your confidence.
- **Re-anchor regularly:** every few rounds, re-read the user's actual request. Is what you're doing now still serving it?

Production deep-research systems all enforce some version of these (Perplexity caps at 3-5 sequential searches per subtopic). Endlessly scouring for sources that don't exist is a real, documented failure mode.

## 11. Synthesis: form a view

- Don't dump notes — form a view. What are the 2–3 things that actually matter? What's the thing most explanations miss?
- Organize by dependency order for conceptual topics (explain the thing you need to understand first, first).
- Name trade-offs and debates explicitly. "It depends" is only useful if you say *on what*.
- Lead with the answer/mental model, then layer nuance — don't make the reader assemble it themselves.
- Tag confidence inline. The reader needs to know which sentences they can act on.
