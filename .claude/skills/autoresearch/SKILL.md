---
name: autoresearch
description: >
  Autonomously research any topic, question, or skill improvement task — deeply,
  without stopping, until you have something genuinely useful to show.
  Use when the user asks you to research how something works, improve an existing
  skill, explore a domain, answer a hard question through investigation, or says
  anything like "figure out X", "go research Y", "dig into Z", "improve the
  [skill] skill", or "learn about X and come back with findings".
  The goal is depth over speed: keep going, follow threads, synthesize,
  and produce something the user can actually use — not a quick surface answer.
---

# Autoresearch

Autonomous deep research on any topic. Research until you have something genuinely useful, then present it.

## When this skill applies

Any time the user hands you a question, topic, or improvement target and wants you to go figure it out — not just answer off the top of your head, but actually investigate:

- **Conceptual questions** — "How does money work?", "How do neural networks learn?"
- **Craft / process questions** — "How do you create a compelling character?", "How does good dialogue work?"
- **Technical investigations** — "How should we parse EPUB files?", "What's the best way to handle auth in this stack?"
- **Skill improvement** — "Improve the parse-epub skill", "Make the autoresearch skill better"
- **Domain exploration** — "What are the key ideas in behavioral economics?"

## Research process

### Step 1: Understand the goal

Before diving in, be clear on what a good outcome looks like:
- What does the user actually need? (quick orientation? deep expertise? a working improvement?)
- What form should the output take? (a summary, an updated skill, a how-to, a list of key ideas, code?)
- Are there existing resources to build on? (existing skills, project files, prior context in the conversation?)

If it's ambiguous, make a reasonable assumption and state it — don't stall asking clarifying questions when you can just start.

### Step 2: Plan research approach

Sketch a brief plan before starting. For most topics this means:
1. What sources will you consult? (web search, docs, code, books, the codebase itself)
2. What are the key sub-questions to answer?
3. What's the dependency order — what do you need to understand first before the harder parts make sense?

### Step 3: Investigate deeply

Go broad first, then go deep on what matters. Research tactics by type:

**Conceptual / domain topics** (money, character creation, etc.)
- Search for authoritative sources, not just the first result
- Find multiple perspectives — beginner explanations AND expert nuance
- Look for frameworks, mental models, and principles — not just facts
- Follow threads: if something is mentioned as important, go understand it

**Technical topics** (how to parse EPUB, how auth works, etc.)
- Look at the spec / standard if one exists
- Find real implementations — libraries, open source code
- Look at edge cases and failure modes, not just the happy path
- Check for existing tools before building from scratch

**Skill improvement** (improve parse-epub, make X skill better)
- Read the existing skill carefully first
- Research what the skill is trying to do — is the approach right?
- Find better techniques, libraries, edge case handling
- Look at what's missing: what would a user realistically run into that the skill doesn't handle?

### Step 4: Synthesize

Don't just collect information — form a view. After gathering:
- What are the 2-3 most important things to understand about this topic?
- What surprised you? What was wrong in your initial assumptions?
- What are the practical implications for the user's specific situation?
- What trade-offs or debates exist that the user should know about?

### Step 5: Produce output

Match the output format to the goal:

| Goal | Output |
|---|---|
| Understand a concept | Structured explanation with key ideas, examples, and "the thing most people miss" |
| Improve a skill | Updated SKILL.md (and scripts/references if needed) — with a summary of what changed and why |
| Answer a technical question | Concrete answer + the reasoning, not just the conclusion |
| Explore a domain | Mental model / framework + key resources to go deeper |

**For skill improvements specifically:** edit the skill files directly, explain what you changed and why, and flag anything you're uncertain about.

### Step 6: Flag what you don't know

Good research surfaces uncertainty, not just confidence. If there are things you couldn't verify, debates that are unresolved, or areas where the user should do their own verification — say so explicitly.

## Depth heuristic

Ask yourself: "If the user asked a smart friend who actually knew this domain, would this answer satisfy them?" If the answer feels shallow or obvious, keep going. The bar is genuinely useful, not technically correct.

A few rounds of research on a rich topic beats one fast pass.

## Output structure (default)

Unless the goal calls for something different:

```
## What I found: [topic]

**The core idea**: [1-2 sentence essence]

**Key points**:
- ...
- ...

**The thing most people miss**: [insight or nuance]

**Practical takeaway**: [what the user should actually do or know]

**Where to go deeper**: [1-3 sources worth reading]

**What I'm uncertain about**: [honest gaps]
```

For skill improvements, skip this template — just edit the skill and write a short summary of the changes.

---

## Worked examples (prompt → research → output)

These show the *shape* of the work at three depths. Adapt; don't copy.

### Short — "Improve the parse-epub skill"

**Prompt:** "Improve the parse-epub skill."

**Research steps:**
1. Read the existing `SKILL.md` and `scripts/parse_epub.py` fully — understand what it does and where it breaks (it targets EPUB 2 / Gutenberg, misses EPUB 3).
2. Web-search the current standard: confirm EPUB 3.3 is the live W3C Recommendation; find the canonical lib (`ebooklib`) and its current version.
3. WebFetch the library docs to verify the real API (`epub.read_epub`, `get_items_of_type(ITEM_DOCUMENT)`).
4. Diff: what does the skill claim vs. what's actually current? List concrete gaps (no EPUB 3 path, no real example output, thin references).
5. Edit the skill in place; add a references file for the spec/lib links.

**Output:** Edited `SKILL.md` + new `references/` file, plus a 4-bullet changelog: what changed, why, and what's still uncertain (e.g., "DRM-protected EPUBs still out of scope — flagged").

### Medium — A technical question: "What's the most reliable way to detect chapter boundaries in an arbitrary EPUB?"

**Research steps:**
1. Frame the sub-questions: How is reading order defined? How are chapters marked across EPUB 2 vs 3? What's the most *authoritative* source of structure?
2. Read the spec (W3C EPUB 3.3) for `nav.xhtml` / `epub:type`; read the EPUB 2 leftover (`toc.ncx`).
3. Find 2–3 real implementations (ebooklib, Calibre's logic) and note how each resolves boundaries.
4. Compare approaches: HTML-class heuristics (brittle) vs. spine order + TOC (authoritative).
5. Synthesize a recommendation with the trade-off stated.

**Output (uses the default template):** core idea ("drive extraction from the spine + TOC, not from HTML class names"), key points, the thing most people miss (TOC entries can deep-link into the *middle* of a content file), practical takeaway, sources, and uncertainties.

### Long — A conceptual deep dive: "How does money actually work?"

**Research steps:**
1. Map the territory first: what are the distinct sub-questions? (what money *is*, how it's *created*, why it has *value*, what *inflation* is). Establish dependency order — you can't explain inflation before money creation.
2. Go broad: gather a beginner framing AND an expert one for each sub-question. Look for *frameworks* (e.g., money as a social ledger; the credit theory vs. commodity theory of money), not just facts.
3. Find primary/authoritative sources for contested points (central-bank explainers on money creation, e.g. Bank of England's "Money creation in the modern economy").
4. Notice and name the live debates (e.g., commodity vs. credit theory; how much banks vs. central banks "create" money).
5. Synthesize a mental model that a smart non-expert could actually hold in their head, then layer nuance on top.

**Output:** A structured explanation organized by the dependency order, leading with the mental model, surfacing the key debate explicitly rather than papering over it, ending with "where to go deeper" and honest uncertainties.

---

## Research methods & sources

A quick map of which tool/source to reach for, and how to use it well. For the longer playbook (query crafting, source triangulation, when to stop), read `references/research-methods.md`.

| Source type | Reach for it when | Tool | Watch out for |
|---|---|---|---|
| **Web search** | Orienting on a topic, finding current state/versions, discovering primary sources | `WebSearch` | First result ≠ best; SEO content farms; stale dates |
| **Official docs / specs** | The authoritative "how it actually works" | `WebFetch` on the canonical URL | Versioned pages drift; confirm you're on the current version |
| **Primary sources** | Contested or high-stakes claims (research papers, standards bodies, original announcements) | `WebFetch` | Secondary summaries distort; go to the source for anything load-bearing |
| **The codebase itself** | Technical questions about *this* project | `Read`, `Grep`, `Glob` | The code is ground truth; comments/docs may lie |
| **Existing skills/files** | Skill-improvement and "how do we already do X" | `Read` | Read it *fully* before judging it |
| **Repo exploration (OSS)** | "How do real implementations handle this?" | `gh`, WebFetch on raw GitHub URLs | One repo's choice isn't the consensus — check 2–3 |

**Core discipline:** triangulate. A claim from one source is a lead; a claim confirmed by an independent second source is a finding. For anything the user will act on, get it from the authoritative source, not a blog summarizing it.

---

## Failure modes (and what to do)

- **Sources contradict each other.** Don't average them. Identify *why* they disagree — different versions? different definitions? one is outdated? a genuine dispute? Prefer the more authoritative/recent source, and if the conflict is real, *report both positions* rather than silently picking one.
- **Unresolved debates.** Some questions have no settled answer (money's nature, "best" architecture for X). The right output is to *frame the debate clearly* — the camps, what each gets right, what's actually at stake — not to fake a verdict.
- **Can't verify a key claim.** Say so explicitly and downgrade your confidence. A flagged unknown is worth more than a confident guess.
- **Rabbit-holing.** Depth is the goal, but a thread that stops paying off should be dropped. Re-check against the user's actual goal: is this still serving it?
- **Stale / hallucinated URLs.** Never cite a doc URL you haven't fetched or that you're inventing from memory. If unsure of a deep link, cite the docs root and flag it.
- **Premature synthesis.** Forming a view before you've gathered enough is the most common way to be confidently wrong. Go broad before you commit to a take.
