# Skills Library Audit & Upgrade — 2026-05-23

Goal: bring every skill in `.claude/skills/` to a consistent quality bar and create new skills for gaps.

**Rubric (score 0–5, done = ≥4 on all five):**
1. when-to-use clarity
2. current 2026 best practices
3. concrete code examples
4. references to authoritative sources
5. edge cases & pitfalls

## Phase 1 — Baseline scorecard

| Skill | WtU | BP | Ex | Ref | Edge | /25 | Status |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| theme-factory | 3 | 2 | 1 | 0 | 1 | 7 | ❌ |
| web-artifacts-builder | 4 | 4 | 3 | 2 | 2 | 15 | ❌ |
| autoresearch | 5 | 4 | 2 | 2 | 3 | 16 | ❌ |
| design-review | 4 | 4 | 3 | 2 | 3 | 16 | ❌ |
| ui-ux-pro-max | 4 | 4 | 2 | 2 | 4 | 16 | ❌ |
| landing-page | 5 | 4 | 2 | 3 | 3 | 17 | ❌ |
| parse-epub | 5 | 3 | 2 | 2 | 5 | 17 | ❌ |
| mcp-builder | 4 | 4 | 3 | 4 | 3 | 18 | ❌ |
| frontend-design | 5 | 5 | 4 | 2 | 3 | 19 | ❌ |
| skill-creator | 5 | 4 | 3 | 3 | 4 | 19 | ❌ |
| design | 5 | 3 | 4 | 5 | 3 | 20 | ❌ |
| threejs-webgl | 5 | 4 | 5 | 2 | 4 | 20 | ❌ |
| aceternity-ui | 5 | 4 | 5 | 4 | 3 | 21 | ❌ |
| tdd | 5 | 5 | 5 | 2 | 4 | 21 | ❌ |
| ui-styling | 5 | 5 | 4 | 5 | 3 | 22 | ❌ |
| modern-web-design | 5 | 5 | 4 | 5 | 4 | 23 | ✅ |
| gsap-scrolltrigger | 5 | 4 | 5 | 4 | 5 | 23 | ✅ |
| react-three-fiber | 4 | 5 | 5 | 4 | 5 | 23 | ✅ |
| design-auditor | 5 | 5 | 4 | 5 | 5 | 24 | ✅ |
| motion-framer | 5 | 5 | 5 | 4 | 5 | 24 | ✅ |
| tailwind-theme-builder | 5 | 5 | 5 | 4 | 5 | 24 | ✅ |

**Baseline: 6 pass / 15 fail.** Dominant gaps: references (external doc links), code examples, edge cases.

## Phase 2 — New skills to create

| New skill | Reason |
|---|---|
| animation-orchestration | Decision system for GSAP vs Motion vs CSS + easing/timing/choreography |
| dark-mode-mastery | Dark-mode strategy (token mapping, contrast, testing) — currently ownerless |
| web-accessibility-audit | Practical a11y auditing + remediation with tooling (axe, Lighthouse) |
| web-performance-audit | Hands-on Core Web Vitals (LCP/CLS/INP) + bundle analysis |
| web-typography-systems | Fluid type scales, variable fonts, line-length, multilingual |

## Phase 2 — Progress log

Scores below are **self-reported by the build agents** (and, for web-typography-systems, the main session) and **structurally verified** (files present, frontmatter intact, not truncated). They were **not** independently re-audited — the re-scoring agents were blocked by an account session limit (resets 9pm America/Los_Angeles, 2026-05-23). Recommend an independent re-audit after reset.

### Improved skills (15)

| Skill | Before | After* | Notes |
|---|:--:|:--:|---|
| theme-factory | 7 | 24 | Full rewrite grounded in real theme files; +3 reference docs |
| web-artifacts-builder | 15 | 24 | Inline component examples + troubleshooting/perf-budget refs |
| landing-page | 17 | 25 | Complete single-file HTML skeleton + edge cases + verified links |
| design-review | 16 | 23 | Motion/interaction checks, 3-breakpoint responsive pattern, fix snippets |
| ui-ux-pro-max | 16 | 23 | Before/after code examples, official-standard links, human-readable palette/font view |
| design | 20 | 25 | Single Gemini-model source-of-truth table + batch-failure recovery |
| threejs-webgl | 20 | 23 | Verified Three.js/WebGPU/shader doc links; version target r184+ |
| aceternity-ui | 21 | 23 | Mobile/landscape + variant-composition edge cases |
| ui-styling | 22 | 24 | When-NOT-to-use, bundle/perf trade-offs, conflict resolution |
| frontend-design | 19 | 25 | MDN/caniuse links per CSS feature + full state-pattern code |
| autoresearch | 16 | 23 | 3 worked examples, research-methods ref, failure modes |
| parse-epub | 17 | 24 | Real EPUB 3 parser (ebooklib), example outputs, W3C/ebooklib refs |
| mcp-builder | 18 | 24 | Complete TS server example + error-handling reference |
| skill-creator | 19 | 24 | 3 annotated example skills, naming/versioning, platform refs |
| tdd | 21 | 24 | Official framework/tool doc links + version notes |

### New skills (5)

| Skill | Status | Notes |
|---|:--:|---|
| animation-orchestration | created | Tool decision matrix (CSS/Motion/GSAP/View Transitions) + choreography/perf refs |
| web-typography-systems | created | Fluid scale, measure, variable fonts, CLS-free loading (+2 refs) — built in main session |
| dark-mode-mastery | created | Semantic token mapping, no-flash, OLED/contrast (+3 refs) |
| web-accessibility-audit | created | Hands-on axe/Lighthouse/SR audit+fix loop (+1 ref) |
| web-performance-audit | created | LCP/CLS/INP measure+fix workflow (+4 refs) |

_*After scores are self-reported/structurally-verified, pending independent re-audit._

## Flagged uncertainties (from build agents)
- Some **deep doc anchors** (Three.js hash routes, MDN deep paths, Material/Apple HIG sub-paths, W3C EPUB a11y) are canonical-but-unfetched; doc roots are confirmed and are safe fallbacks.
- **design**: `gemini-3.1-pro-preview` / `gemini-3.1-flash-image-preview` are preview model strings that can change; script defaults were left unchanged (still `gemini-2.5-flash-image`).
- **parse-epub**: the commercial EPUB 3 example JSON uses illustrative values (no commercial EPUB / ebooklib available locally to run).
- **mcp-builder**: kept the published `@modelcontextprotocol/sdk` 1.x imports; a "V2" SDK site exists and may change import paths later.

## Phase 2 — Independent re-audit results (9pm PT, same day)

All 20 touched skills re-scored by fresh read-only agents with no knowledge of expected scores.

| Skill | Re-audit score | Pass? | Notes |
|---|:--:|:--:|---|
| theme-factory | 24/25 | ✅ | — |
| web-artifacts-builder | 24/25 | ✅ | — |
| landing-page | 25/25 | ✅ | — |
| design-review | 24/25 | ✅ | — |
| ui-ux-pro-max | 23/25 | ❌→✅ | edge-cases=3; fixed (failure narratives added) |
| design | 24/25 | ✅ | — |
| threejs-webgl | 23/25 | ✅ | — |
| aceternity-ui | 24/25 | ✅ | — |
| ui-styling | 22/25 | ✅ | — |
| frontend-design | 23/25 | ✅ | — |
| autoresearch | 24/25 | ✅ | — |
| parse-epub | 24/25 | ✅ | — |
| mcp-builder | 21/25 | ❌→✅ | edge-cases=3; fixed (failure modes surfaced in SKILL.md body) |
| skill-creator | 22/25 | ✅ | — |
| tdd | 25/25 | ✅ | — |
| animation-orchestration | 25/25 | ✅ | new skill |
| web-typography-systems | 24/25 | ✅ | new skill |
| dark-mode-mastery | 24/25 | ✅ | new skill |
| web-accessibility-audit | 24/25 | ✅ | new skill |
| web-performance-audit | 24/25 | ✅ | new skill |

**Final: 20/20 pass** (18 passed re-audit; 2 required one targeted fix then confirmed passing).

## Remaining
- Git: all changes are **uncommitted** in `website/visurena`. Commit when ready.
