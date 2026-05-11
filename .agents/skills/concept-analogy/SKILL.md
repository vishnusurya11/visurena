---
name: concept-analogy
description: >
  When Vishnu shares a URL, paper, video, or names a concept (especially around
  LLMs, ML, mech interp), this skill: (1) reads the source, (2) identifies the
  core concept, (3) finds an analogy whose structure ACTUALLY MAPS onto the
  concept (not a surface "think of it like X"), and (4) places the concept in
  the right spot in his knowledge graph at /Users/vishnusuryareddynandi/Projects/issac/isaac.html.
  Use whenever Vishnu sends a learning resource, asks "where does X fit?",
  asks for an explanation of a new concept, or says "improve this skill".
  The fundamental rule: every analogy must pass the structural mapping test
  (5 questions, below) before being offered. Surface analogies are rejected.
---

# Concept Analogy

The job: turn an LLM concept into something Vishnu can SEE — via an analogy whose pieces actually correspond to the concept's pieces — and add it to his knowledge graph in the right place.

## The Analogy Rule (most important section)

A good analogy is **structural**, not surface-level. Most "explain it to a kid" attempts fail because they pick a surface comparison ("attention is like paying attention in class") that doesn't actually map onto how the concept works.

### The 5-question test

Before offering ANY analogy, walk through these. Out loud, in your reasoning. Don't skip.

1. **Source domain** — what everyday thing am I comparing to?
2. **Source entities & relations** — what are the parts, and how do they relate?
3. **Target entities & relations** — what are the parts of the actual concept, and how do they relate?
4. **One-to-one mapping** — does each source entity correspond to exactly one target entity?
5. **Relation preservation** — if A causes B in the source, does A' cause B' in the target? If A is bigger than B in the source, is A' bigger than B' in the target?

If any of these fail, **the analogy is surface-level**. Throw it away. Find another.

### Examples

✅ **GOOD — KV Cache as "writing notes in the margin while reading"**
- Source: reading a book + writing chapter-summary notes
- Source entities: pages already read, margin notes, current page
- Target entities: previously-generated tokens, cached K/V vectors, current token
- Mapping:
  - pages already read ↔ previous tokens
  - margin notes ↔ cached K/V
  - current page ↔ token being generated
- Relations preserved: cumulative state (notes grow), expensive recomputation avoided (don't reread), lookup is cheap, only the new page needs new processing.
- All 5 checks pass. ✓

❌ **BAD — KV Cache as "a friend reminding you what you said"**
- Mapping fails: a "friend" isn't a structured tensor, "reminding" isn't lookup, the relations don't preserve.
- Surface-level. ✗

✅ **GOOD — Subword Tokenization as "Scrabble tiles with common combinations"**
- Source entities: tiles (letters + common combos like "ing", "tion"), bag, words you build
- Target entities: tokens (chars + subwords), vocabulary, sentences
- Mapping:
  - tiles ↔ tokens
  - bag ↔ vocabulary
  - words built ↔ tokenized text
- Relations preserved: combinatorial composition (you build big from small), finite vocab, novel words possible from familiar pieces.

❌ **BAD — Tokenization as "a knife"**
- A knife cuts. But it doesn't preserve meaning, doesn't have a vocabulary, doesn't compose.
- Mapping fails. ✗

✅ **GOOD — Gradient Descent as "walking down a foggy hill, can only see your feet"**
- Source entities: hiker, slope at feet, step direction
- Target entities: parameters, gradient, update direction
- Mapping is exact. Relations preserved (always go downhill, you reach a valley but maybe not the lowest valley = local minimum).

❌ **BAD — Gradient Descent as "trying random things until one works"**
- Random ≠ following a gradient. The whole point of gradient descent is the *direction* information.
- Mapping fails. ✗

## Process when invoked

### Step 1: Read the source

If given a URL: use WebFetch.
If given a paper: read it (or fetch the abstract + key sections).
If given a video URL with no transcript: WebSearch for an explainer of that video.
If given a concept name only: WebSearch for the canonical reference (paper, blog post, doc).

If the source is too long, focus on:
- The introduction (problem framing)
- The first technical section (mechanism)
- Any diagrams (often the cleanest source for analogies)

### Step 2: Identify THE concept

Most articles cover multiple things. Pick the ONE main concept. Write it as a single sentence aimed at a curious 12-year-old.

Sanity check: if you can't write the one-sentence version, you don't understand it yet. Read more.

### Step 3: Brainstorm 3 analogies

Generate at least 3 candidate analogies. For each, run the 5-question test. Reject the ones that fail. Keep the cleanest one that passes.

If none pass, that's important — say so, and explain that this concept is genuinely hard to analogize. Better to be honest than to ship a bad analogy.

### Step 4: Locate in the existing graph

Read the `NODES` and `EDGES` arrays in `/Users/vishnusuryareddynandi/Projects/issac/isaac.html`.

For the new concept, decide:
- **Category** — one of: `foundations`, `tokenization`, `embeddings`, `position`, `attention`, `transformer`, `output`, `training`, `interp`, `ami`. Add a new category only if truly necessary.
- **Prerequisites** — which existing node IDs must Vishnu know first? List them.
- **Children** — which existing nodes should now have this as a prereq? (Often none. Don't force it.)

If the concept is already covered by an existing node, don't create a duplicate. Either:
- Update the existing node to absorb the new info, or
- Just tell Vishnu it's already covered and link to the existing one.

### Step 5: Write the node

Add a new entry to the `NODES` array with this shape:

```js
{
  id: '<kebab-case-id>',
  label: '<Human Readable Name>',
  category: '<one of the categories>',
  oneliner: '<one sentence to a curious 12-year-old>',
  analogy: {
    source: '<the everyday thing>',
    mapping: '<2-3 sentences spelling out the structural mapping — what corresponds to what, and which relations are preserved>'
  },
  explanation: '<2-3 paragraphs, conversational, like the YouTube transcripts in raw_data/. Walks through the concept with the analogy threaded in, addresses "you might be wondering..." moments, ends with why it matters.>',
  prereqs: ['<existing-node-id-1>', '<existing-node-id-2>']
}
```

Add prereq edges to the `EDGES` array:
```js
{ from: '<prereq-id>', to: '<new-id>' }
```

### Step 6: Verify

After editing isaac.html:
1. Run `node --check` on the embedded `<script>` (extract it, check syntax).
2. Visually skim the new node entry — does the analogy still pass the 5-question test when you re-read it?

### Step 7: Tell Vishnu, briefly

Format:
```
Added **{Label}** to the {Category} branch of the graph.
Prerequisites: {prereq labels, comma-separated}
Analogy: {source domain in one phrase} → {what it maps to}
The graph will re-render when you reopen isaac.html.
```

Keep it short. He doesn't need a long writeup — he needs to know it landed in the right spot.

## When invoked with "improve this skill"

Run autoresearch on:
- Recent work on analogical reasoning in technical education (Gentner's structure-mapping theory is the classic reference)
- Best ML explainers (3Blue1Brown, Andrej Karpathy, Distill.pub, Anthropic's research blog, Ben Eater)
- Common analogy failures in ML pedagogy (e.g., "neurons in the brain" for neural nets — surface-level)

Then update this SKILL.md:
- Add new examples to the GOOD/BAD lists if you find better ones
- Tighten the 5-question test if you find a sharper formulation
- Add a "category" if a recurring pattern emerges (e.g., "process analogies", "container analogies", "agent analogies")

## Constraints

- **Never invent ML facts.** If you're uncertain about how a concept actually works, say so explicitly and offer to research it more.
- **Never pick an analogy because it's clever.** Pick it because it maps. If a clever analogy fails the 5-question test, throw it away.
- **Never create duplicate nodes.** Search the existing graph first.
- **Match Vishnu's tone:** warm, conversational, professor-explaining-to-a-curious-kid. Not corporate, not textbook-y.
- **Single sentence one-liners.** No "this concept is interesting because..." preambles.
- **2-3 paragraph explanations.** Not essays.

## Anti-patterns to avoid

- "It's kind of like..." (vague, not a real analogy)
- "Imagine a brain..." (surface-level, every ML concept gets this)
- "Think of it as a black box that..." (this is just describing the function, not analogizing)
- "It's similar to {another ML concept}..." (analogizing target to target, not target to source)
- Mixing two analogies in one explanation (confuses the mapping)
- Picking analogies the user already gave (be original)
