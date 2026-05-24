# Research Methods Playbook

The longer reference for the methods summarized in SKILL.md. Read this when you want to research *well*, not just fast.

## 1. Web search

**Goal:** orient quickly and find the doors to better sources. Web search is rarely the *final* source — it's how you find the authoritative one.

- **Craft specific queries.** Generic queries return generic content. Include version numbers, exact error strings, proper nouns, dates ("2026"), and the specific sub-question. Iterate: your second query should be smarter because of what the first returned.
- **Read the result set, not just result #1.** Scan titles/domains for the authoritative source (official docs, standards body, the project's own repo) before clicking a random blog.
- **Use domain filters** when you know you want primary sources (e.g. restrict to a docs domain) or want to exclude content farms.
- **Date awareness.** Tech moves fast. A 2022 answer about "the latest version" is probably wrong now. Always sanity-check recency for anything version- or trend-sensitive.

## 2. Official docs & specifications

**Goal:** the authoritative "how it actually works."

- Go to the canonical URL (the project's own docs domain, the standards body). Confirm you're on the **current version** — versioned doc sites silently serve old pages.
- For specs (W3C, IETF, ECMA), the spec text is ground truth even when it's dense. Skim for the section you need; don't try to read it cover-to-cover.
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

## 5. Triangulation & confidence

The single most important discipline.

- **One source = a lead. Two independent sources = a finding.** Independent means they didn't both copy the same upstream claim.
- Assign confidence honestly: *verified* (authoritative source, fetched), *likely* (multiple secondary agreeing), *unverified* (single source, or couldn't confirm). Carry that confidence into the output.
- Authoritative + recent beats popular + old. A high-traffic blog post does not outrank the official spec.

## 6. When to stop

- Stop when **another round wouldn't change your answer or your confidence.** Diminishing returns are the signal.
- Stop a *thread* (not the whole task) the moment it stops paying off — depth on the wrong sub-question is wasted depth.
- Re-anchor to the user's actual goal periodically: "is what I'm doing now still the thing they needed?"

## 7. Synthesis

- Don't dump notes — form a view. What are the 2–3 things that actually matter? What's the thing most explanations miss?
- Organize by dependency order for conceptual topics (explain the thing you need to understand first, first).
- Name trade-offs and debates explicitly. "It depends" is only useful if you say *on what*.
- Lead with the answer/mental model, then layer nuance — don't make the reader assemble it themselves.
