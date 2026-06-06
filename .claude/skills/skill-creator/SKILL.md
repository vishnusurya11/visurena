---
name: skill-creator
description: >
  Use when the user wants to create, edit, benchmark, or optimize a Claude skill —
  phrases like "make a skill for X", "improve this skill", "the skill isn't triggering",
  "run evals on the skill", "tune the description", "package the skill". Also use when
  research/work in another skill surfaces that a skill itself needs to change. Do NOT
  use this skill for general project planning, feature implementation, or content work
  — it is about the *skill artifact* itself (SKILL.md, references, scripts, evals).
  Project bias: this repo is a React/Next.js cinematic media platform (Visurena);
  most skills created here will be UI / frontend / web / design-focused, so default
  to the lightweight iteration path unless the user asks for the full benchmark loop.
---

# Skill Creator

Create new skills and iteratively improve them. There are two paths through this — pick the right one upfront.

## Two paths

- **Path A — Quick iteration** (the default for UI, design, and one-off skills). Draft → 2-3 manual test runs → qualitative review with the user → revise → repeat. No assertions, no benchmark JSON, no eval viewer. Most UI/design skills land here because their outputs are subjective.
- **Path B — Full benchmark loop** (use when correctness is objectively verifiable and the skill is production-critical). Draft → spawn with-skill + baseline subagents in parallel → quantitative assertions + qualitative review in the viewer → revise → re-benchmark. Heavier but produces hard evidence the skill actually helps.

**How to pick:**

| Signal | Path |
|---|---|
| UI/design/styling/writing skill (subjective outputs) | **A** |
| Skill that produces deterministic artifacts (a CSV, a transformed file, parsed JSON, a passing test) | **B** |
| Skill that's been broken in production / regressing | **B** |
| One-shot project skill the user wants in an hour | **A** |
| Skill that 100+ teammates will hit | **B** |

When in doubt: start in A; promote to B if the skill matters and you're not converging.

## Where the user is in the loop

Your job is to figure out where the user is and jump in:

- *"I want a skill for X"* → start at "Capture intent" and walk forward.
- *"Here's a draft, make it better"* → go straight to test runs (A) or eval loop (B).
- *"Just vibe with me"* → strict Path A; skip the eval-viewer machinery; iterate by reading and editing.
- *"The skill isn't triggering"* → jump to "Description optimization."
- *"Package this so I can share it"* → jump to "Package and Present."

## Communicating with the user

Skill creator gets used by people across a wide range of technical familiarity. Read the user's vocabulary in their first few messages — "evaluation" and "benchmark" are borderline; "JSON" and "assertion" need confirmation the user is fluent before you use them unexplained. When in doubt, briefly define a term inline.

---

## Project context (Visurena)

This skill creator lives in a React/Next.js cinematic media platform repo. Most skills authored here will be **UI / frontend / web / design** focused. Before drafting a new skill:

1. **Check whether an existing skill already covers it.** The repo has overlapping skills in design (`frontend-design`, `modern-web-design`, `ui-styling`, `ui-ux-pro-max`), animation (`motion-framer`, `gsap-scrolltrigger`, `aceternity-ui`, `animation-orchestration`), 3D (`threejs-webgl`, `react-three-fiber`), perf (`web-performance-audit`, `media-catalog-performance`), a11y (`web-accessibility-audit`, `design-auditor`), tokens (`design-system`, `tailwind-theme-builder`, `dark-mode-mastery`), media (`media-playback`, `realtime-live-ui`, `entertainment-platform-ui`). If one of these already triggers on the user's request, **defer to it** rather than building a competing skill. New skills should fill *gaps*, not compete.
2. **Default to Path A (quick iteration)** for UI/design skills. Their outputs are subjective; the formal benchmark loop is mostly overhead.
3. **For research grounding**, use the `autoresearch` skill first when the user wants the new skill to encode current best practice ("research how X works, then turn it into a skill"). Don't try to encode best practice from memory.

---

## Creating a skill

### Capture Intent

Start by understanding the user's intent. The conversation may already contain a workflow the user wants to capture (e.g., "turn this into a skill"). Extract from history first — tools used, sequence of steps, corrections, input/output formats observed. Fill gaps with the user; confirm before moving on.

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases / contexts / near-misses)
3. What's the expected output format?
4. Path A or Path B? Skills with objectively verifiable outputs (file transforms, parsed JSON, passing tests, deterministic code) benefit from Path B. Subjective skills (writing style, UI/design quality, art) almost always belong in Path A. Suggest the default; let the user override.

### Interview and Research

Proactively ask about edge cases, input/output formats, example files, success criteria, and dependencies. Wait to write test prompts until this is ironed out.

If the skill encodes domain best practices — current UI patterns, modern lib behavior, perf or a11y rules — **invoke `autoresearch` first** to ground the skill in primary sources rather than guesses. A skill built on stale knowledge is worse than no skill.

Check available MCPs; if useful for research, run in parallel via subagents if available, otherwise inline.

### Write the SKILL.md

Based on the user interview, fill in:

- **name**: Skill identifier. kebab-case, names the capability, stable forever.
- **description**: The single most-important field. It's what Claude reads to decide whether to invoke the skill. Follow the **What → When → Do-not** formula:
  - **What** — one sentence on the capability.
  - **When** — concrete user phrases / situations / contexts. Lead with "Use when…". Be a little "pushy" (Claude under-triggers by default) — list the casual phrasings users actually say, not just the formal name of the task.
  - **Do-not** — one short clause naming the near-miss case where this skill should NOT fire (the adjacent skill that should win instead). This is what prevents over-triggering. Example: a PDF-extract skill should add "Do NOT use for general file I/O or for PDFs that just need to be read inline."
  - **Project bias** — if the skill is project-specific, name the project context briefly so it doesn't fire on unrelated work.
  - Keep total description under ~1024 chars (the spec limit).
- **compatibility** *(optional)*: real environment requirements only — Python version, required tools, headless-vs-display constraints. Don't pad with obvious stuff.
- **the rest of the skill**: see Skill Writing Guide below.

**Triggering rigor — get this right.** Descriptions either over- or under-trigger. The dangerous failure mode is **near-misses**: queries that share keywords with the skill but actually need a different one. When writing the description, deliberately think about: what would a *neighboring* skill do? what's the *one-word* difference between "this fires" and "this doesn't"? Put that distinction in the description (usually via the Do-not clause). The full optimization loop later validates this; getting it close on the first pass saves iterations.

### Skill Writing Guide

#### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    - Executable code for deterministic/repetitive tasks
    ├── references/ - Docs loaded into context as needed
    └── assets/     - Files used in output (templates, icons, fonts)
```

#### Naming conventions

The skill's **directory name** and its `name` frontmatter field should match, and both should follow these rules:

- **kebab-case, lowercase**: `parse-epub`, `commit-message`, `cloud-deploy` — not `ParseEpub`, `parse_epub`, or `Parse EPUB`.
- **Verb-or-noun that names the capability**, not the implementation: `csv-profile` (good) over `pandas-runner` (leaks the how).
- **Specific enough to be unambiguous** in a list of dozens of skills: `mcp-builder` not `builder`; `epub-to-json` is clearer than `converter`.
- **Stable** — the name is the identity. Renaming a published/installed skill breaks references and re-triggers re-installation. Pick a name you won't want to change.
- Avoid version suffixes in the name (`research-helper-v2`) — versioning belongs in source control, not the identifier. When updating an installed skill, **keep the original name unchanged**.

For more worked examples of well-named, well-shaped skills at three complexity levels, see `references/example-skills.md`.

#### Version control for skill iterations

Skills are code — track them in git like code. This matters because skill iteration is inherently experimental: you'll try changes, some will regress quality, and you need a clean way to compare and roll back.

- **Commit before a major rewrite.** A skill that scored well is a known-good baseline; commit it so you can `git diff` / revert if a "improvement" makes things worse. The benchmark loop in this skill compares against a baseline — git is the durable version of that baseline.
- **One logical change per commit**, with a message noting *what changed and why* (e.g., "csv-profile: bundle profiling script — every test run was rewriting the same pandas helper"). This makes the iteration history a readable record of what worked.
- **Don't encode versions in the name or directory.** `git log`/tags carry version history; `research-helper-v2/` just creates two skills that compete to trigger.
- When the skill-creator workflow snapshots a skill before editing (`cp -r <skill-path> <workspace>/skill-snapshot/`), that snapshot is a throwaway baseline for one benchmark run — git is the permanent record.

#### Progressive Disclosure

Skills use a three-level loading system:
1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - In context whenever skill triggers (<500 lines ideal)
3. **Bundled resources** - As needed (unlimited, scripts can execute without loading)

These word counts are approximate and you can feel free to go longer if needed.

**Key patterns:**
- Keep SKILL.md under 500 lines; if you're approaching this limit, add an additional layer of hierarchy along with clear pointers about where the model using the skill should go next to follow up.
- Reference files clearly from SKILL.md with guidance on when to read them
- For large reference files (>300 lines), include a table of contents

**Domain organization**: When a skill supports multiple domains/frameworks, organize by variant:
```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
Claude reads only the relevant reference file.

#### Principle of Lack of Surprise

This goes without saying, but skills must not contain malware, exploit code, or any content that could compromise system security. A skill's contents should not surprise the user in their intent if described. Don't go along with requests to create misleading skills or skills designed to facilitate unauthorized access, data exfiltration, or other malicious activities. Things like a "roleplay as an XYZ" are OK though.

#### Writing Patterns

Prefer using the imperative form in instructions.

**Defining output formats** - You can do it like this:
```markdown
## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Examples pattern** - It's useful to include examples. You can format them like this (but if "Input" and "Output" are in the examples you might want to deviate a little):
```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

### Writing Style

Explain to the model **why** things matter rather than yelling MUSTs at it. Modern Claude has good theory of mind — given the reason behind a rule, it can apply that rule sensibly in edge cases. Heavy-handed rigid structures break down on new situations; rationale-driven instructions generalize.

Make skills general, not narrowly tied to one example. Write a draft, then look at it with fresh eyes and tighten it.

---

### UI / frontend skill design (special handling)

Most skills created in this repo are UI-focused, and UI skills have failure modes that data-processing skills don't.

**Default to Path A.** UI/design outputs are subjective — pixel diffs are flaky, "looks right" depends on context, and the formal benchmark loop adds overhead without a corresponding quality signal. Qualitative review with the user is usually the right loop.

**Fight distributional convergence with negation.** Without explicit guidance, Claude defaults to AI-slop UI aesthetics: Inter everywhere, purple gradients, generic centered hero, the same shadcn-default everything. The strongest UI skills (Anthropic's `frontend-design`, `web-artifacts-builder`) front-load NEVER lists — "don't use Inter, don't use purple gradients, don't use centered single-column hero, don't default to the rounded-2xl border-card pattern." Naming the cliché kills it. Add a NEVER list to any UI skill that's meant to look distinctive.

**Bundle design tokens as assets, not prose.** If a skill needs a palette, type scale, or radius scale, put it in `assets/tokens.json` (or `assets/tokens.css`) and have the skill reference it. Don't list 50 hex codes inline — they're noise in context and a maintenance trap.

**Compose, don't compete.** Visurena already has strong UI skills. A new UI skill should sit between them, not duplicate them. Examples of valid gaps: a *specific component pattern* not covered by `ui-styling` or `aceternity-ui`; a *project-specific page template* not covered by `entertainment-platform-ui`; a *workflow* (e.g., "convert a Figma frame into a shadcn component") that no existing skill covers end-to-end. If the new skill description overlaps with an existing one, add a Do-not clause naming the existing skill — or skip the new skill entirely.

**Evals when they're worth it.** If you do want quantitative signal on a UI skill, prefer **structural assertions** (DOM/component presence, props passed, files emitted) over pixel/screenshot diffs. Playwright baseline comparison produces sub-pixel false positives that drown the signal. Structural checks are stable.

**Project-specific patterns to reference for UI skills:**
- Tokens & dark mode → `design-system`, `tailwind-theme-builder`, `dark-mode-mastery`
- Animation tool selection → `animation-orchestration` (then it routes to `motion-framer` / `gsap-scrolltrigger`)
- Performance budgets → `web-performance-audit`, `media-catalog-performance`
- A11y verification → `web-accessibility-audit`, `design-auditor`

---

### Test Cases

After writing the skill draft, come up with 2-3 realistic test prompts — the kind of thing a real user would actually say. Share them with the user: [you don't have to use this exact language] "Here are a few test cases I'd like to try. Do these look right, or do you want to add more?" Then run them.

Save test cases to `evals/evals.json`. Don't write assertions yet — just the prompts. You'll draft assertions in the next step while the runs are in progress.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": []
    }
  ]
}
```

See `references/schemas.md` for the full schema (including the `assertions` field, which you'll add later).

## Running and evaluating test cases

This is **Path B — full benchmark loop**. For Path A (default for UI/subjective skills), skip to "Path A — quick iteration" below.

### Path A — Quick iteration (default)

For UI, design, writing, and one-off skills:

1. Draft the skill (frontmatter + body).
2. Pick 2-3 realistic prompts. Show them to the user; let them tweak.
3. Run each prompt **in a fresh subagent with the skill loaded** (or, if the user prefers, in a new Claude session). Save outputs to `<skill>-workspace/quick/<prompt-slug>/`.
4. Walk the user through the outputs in chat. Ask: "does this match what you'd want? where does it miss?"
5. Edit the skill. Repeat.
6. Stop when the user says it's good — *or* after 2-3 rounds of "no notable change" in their feedback (you've converged).

That's it. No assertions, no benchmark JSON, no viewer. Promote to Path B only if you're not converging or the user asks for harder evidence.

### Path B — Full benchmark loop

Use when correctness is objectively verifiable (file transforms, parsed JSON, code that should pass tests, deterministic workflows) or when the skill is production-critical and you need hard evidence.

This section is one continuous sequence — don't stop partway through. Do NOT use `/skill-test` or any other testing skill.

Put results in `<skill-name>-workspace/` as a sibling to the skill directory. Organize by iteration (`iteration-1/`, `iteration-2/`, etc.) and within that, each test case gets a directory (`eval-0/`, `eval-1/`, etc.). Create directories as you go.

### Step 1: Spawn all runs (with-skill AND baseline) in the same turn

For each test case, spawn two subagents in the same turn — one with the skill, one without. This is important: don't spawn the with-skill runs first and then come back for baselines later. Launch everything at once so it all finishes around the same time.

**With-skill run:**

```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <what the user cares about — e.g., "the .docx file", "the final CSV">
```

**Baseline run** (same prompt, but the baseline depends on context):
- **Creating a new skill**: no skill at all. Same prompt, no skill path, save to `without_skill/outputs/`.
- **Improving an existing skill**: the old version. Before editing, snapshot the skill (`cp -r <skill-path> <workspace>/skill-snapshot/`), then point the baseline subagent at the snapshot. Save to `old_skill/outputs/`.

Write an `eval_metadata.json` for each test case (assertions can be empty for now). Give each eval a descriptive name based on what it's testing — not just "eval-0". Use this name for the directory too. If this iteration uses new or modified eval prompts, create these files for each new eval directory — don't assume they carry over from previous iterations.

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

### Step 2: While runs are in progress, draft assertions

Don't just wait for the runs to finish — you can use this time productively. Draft quantitative assertions for each test case and explain them to the user. If assertions already exist in `evals/evals.json`, review them and explain what they check.

Good assertions are objectively verifiable and have descriptive names — they should read clearly in the benchmark viewer so someone glancing at the results immediately understands what each one checks. Subjective skills (writing style, design quality) are better evaluated qualitatively — don't force assertions onto things that need human judgment.

Update the `eval_metadata.json` files and `evals/evals.json` with the assertions once drafted. Also explain to the user what they'll see in the viewer — both the qualitative outputs and the quantitative benchmark.

### Step 3: As runs complete, capture timing data

When each subagent task completes, you receive a notification containing `total_tokens` and `duration_ms`. Save this data immediately to `timing.json` in the run directory:

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

This is the only opportunity to capture this data — it comes through the task notification and isn't persisted elsewhere. Process each notification as it arrives rather than trying to batch them.

### Step 4: Grade, aggregate, and launch the viewer

Once all runs are done:

1. **Grade each run** — spawn a grader subagent (or grade inline) that reads `agents/grader.md` and evaluates each assertion against the outputs. Save results to `grading.json` in each run directory. The grading.json expectations array must use the fields `text`, `passed`, and `evidence` (not `name`/`met`/`details` or other variants) — the viewer depends on these exact field names. For assertions that can be checked programmatically, write and run a script rather than eyeballing it — scripts are faster, more reliable, and can be reused across iterations.

2. **Aggregate into benchmark** — run the aggregation script from the skill-creator directory:
   ```bash
   python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
   ```
   This produces `benchmark.json` and `benchmark.md` with pass_rate, time, and tokens for each configuration, with mean ± stddev and the delta. If generating benchmark.json manually, see `references/schemas.md` for the exact schema the viewer expects.
Put each with_skill version before its baseline counterpart.

3. **Do an analyst pass** — read the benchmark data and surface patterns the aggregate stats might hide. See `agents/analyzer.md` (the "Analyzing Benchmark Results" section) for what to look for — things like assertions that always pass regardless of skill (non-discriminating), high-variance evals (possibly flaky), and time/token tradeoffs.

4. **Launch the viewer** with both qualitative outputs and quantitative data:
   ```bash
   nohup python <skill-creator-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   For iteration 2+, also pass `--previous-workspace <workspace>/iteration-<N-1>`.

   **Cowork / headless environments:** If `webbrowser.open()` is not available or the environment has no display, use `--static <output_path>` to write a standalone HTML file instead of starting a server. Feedback will be downloaded as a `feedback.json` file when the user clicks "Submit All Reviews". After download, copy `feedback.json` into the workspace directory for the next iteration to pick up.

Note: please use generate_review.py to create the viewer; there's no need to write custom HTML.

5. **Tell the user** something like: "I've opened the results in your browser. There are two tabs — 'Outputs' lets you click through each test case and leave feedback, 'Benchmark' shows the quantitative comparison. When you're done, come back here and let me know."

### What the user sees in the viewer

The "Outputs" tab shows one test case at a time:
- **Prompt**: the task that was given
- **Output**: the files the skill produced, rendered inline where possible
- **Previous Output** (iteration 2+): collapsed section showing last iteration's output
- **Formal Grades** (if grading was run): collapsed section showing assertion pass/fail
- **Feedback**: a textbox that auto-saves as they type
- **Previous Feedback** (iteration 2+): their comments from last time, shown below the textbox

The "Benchmark" tab shows the stats summary: pass rates, timing, and token usage for each configuration, with per-eval breakdowns and analyst observations.

Navigation is via prev/next buttons or arrow keys. When done, they click "Submit All Reviews" which saves all feedback to `feedback.json`.

### Step 5: Read the feedback

When the user tells you they're done, read `feedback.json`:

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "the chart is missing axis labels", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": "", "timestamp": "..."},
    {"run_id": "eval-2-with_skill", "feedback": "perfect, love this", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Empty feedback means the user thought it was fine. Focus your improvements on the test cases where the user had specific complaints.

Kill the viewer server when you're done with it:

```bash
kill $VIEWER_PID 2>/dev/null
```

---

## Improving the skill

This is the heart of the loop. You've run the test cases, the user has reviewed the results, and now you need to make the skill better based on their feedback.

### How to think about improvements

1. **Generalize from the feedback.** Skills get invoked thousands of times across prompts you'll never see. You and the user are iterating on a handful of examples because that's the fastest signal — but a skill that only works on those examples is useless. When you hit a stubborn issue, don't add a fiddly special-case rule; branch out, try a different metaphor or a different work pattern. It's cheap to try and you may land on something that generalizes.

2. **Keep the prompt lean.** Remove anything not pulling its weight. **Read the transcripts**, not just the final outputs — if the skill is making the model waste time on unproductive detours, cut the parts that caused it and re-run.

3. **Explain the why.** Modern Claude has good theory of mind. Given the reason behind a rule, it applies that rule sensibly in cases the rule didn't anticipate. ALWAYS/NEVER in all caps is a yellow flag — if you can, reframe as "we do X because Y, otherwise Z" and the model handles edge cases on its own.

4. **Look for repeated work across test cases.** If all 3 runs independently wrote the same helper (`create_docx.py`, `build_chart.py`), that's the signal to bundle it in `scripts/`. Write it once, point the skill at it; every future invocation skips that overhead.

5. **Take your time on the rewrite.** Draft, then look at the draft cold and tighten it. The user can wait a minute; they can't unread a sloppy revision.

### Baseline rule for improvement runs

When iterating an existing skill, **the baseline is always the version the user came in with (v0), not the previous iteration**. Otherwise iteration 3 can look better than iteration 2 while being worse than v0 — you've drifted, not improved. Snapshot v0 once at the start (`cp -r <skill-path> <workspace>/v0-snapshot/`), and point every baseline run at that snapshot.

### The iteration loop

After improving the skill:

1. Apply your improvements to the skill
2. Rerun all test cases into a new `iteration-<N+1>/` directory, including baseline runs. If you're creating a new skill, the baseline is always `without_skill` (no skill) — that stays the same across iterations. If you're improving an existing skill, use your judgment on what makes sense as the baseline: the original version the user came in with, or the previous iteration.
3. Launch the reviewer with `--previous-workspace` pointing at the previous iteration
4. Wait for the user to review and tell you they're done
5. Read the new feedback, improve again, repeat

Keep going until:
- The user says they're happy
- The feedback is all empty (everything looks good)
- You're not making meaningful progress

---

## Advanced: Blind comparison

For situations where you want a more rigorous comparison between two versions of a skill (e.g., the user asks "is the new version actually better?"), there's a blind comparison system. Read `agents/comparator.md` and `agents/analyzer.md` for the details. The basic idea is: give two outputs to an independent agent without telling it which is which, and let it judge quality. Then analyze why the winner won.

This is optional, requires subagents, and most users won't need it. The human review loop is usually sufficient.

---

## Description Optimization

The description field in SKILL.md frontmatter is the primary mechanism that determines whether Claude invokes a skill. After creating or improving a skill, offer to optimize the description for better triggering accuracy.

### Step 1: Generate trigger eval queries

Create 20 eval queries — a mix of should-trigger and should-not-trigger. Save as JSON:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

The queries must be realistic and something a Claude Code or Claude.ai user would actually type. Not abstract requests, but requests that are concrete and specific and have a good amount of detail. For instance, file paths, personal context about the user's job or situation, column names and values, company names, URLs. A little bit of backstory. Some might be in lowercase or contain abbreviations or typos or casual speech. Use a mix of different lengths, and focus on edge cases rather than making them clear-cut (the user will get a chance to sign off on them).

Bad: `"Format this data"`, `"Extract text from PDF"`, `"Create a chart"`

Good: `"ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage. The revenue is in column C and costs are in column D i think"`

For the **should-trigger** queries (8-10), think about coverage. You want different phrasings of the same intent — some formal, some casual. Include cases where the user doesn't explicitly name the skill or file type but clearly needs it. Throw in some uncommon use cases and cases where this skill competes with another but should win.

For the **should-not-trigger** queries (8-10), the most valuable ones are the near-misses — queries that share keywords or concepts with the skill but actually need something different. Think adjacent domains, ambiguous phrasing where a naive keyword match would trigger but shouldn't, and cases where the query touches on something the skill does but in a context where another tool is more appropriate.

The key thing to avoid: don't make should-not-trigger queries obviously irrelevant. "Write a fibonacci function" as a negative test for a PDF skill is too easy — it doesn't test anything. The negative cases should be genuinely tricky.

### Step 2: Review with user

Present the eval set to the user for review using the HTML template:

1. Read the template from `assets/eval_review.html`
2. Replace the placeholders:
   - `__EVAL_DATA_PLACEHOLDER__` → the JSON array of eval items (no quotes around it — it's a JS variable assignment)
   - `__SKILL_NAME_PLACEHOLDER__` → the skill's name
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` → the skill's current description
3. Write to a temp file (e.g., `/tmp/eval_review_<skill-name>.html`) and open it: `open /tmp/eval_review_<skill-name>.html`
4. The user can edit queries, toggle should-trigger, add/remove entries, then click "Export Eval Set"
5. The file downloads to `~/Downloads/eval_set.json` — check the Downloads folder for the most recent version in case there are multiple (e.g., `eval_set (1).json`)

This step matters — bad eval queries lead to bad descriptions.

### Step 3: Run the optimization loop

Tell the user: "This will take some time — I'll run the optimization loop in the background and check on it periodically."

Save the eval set to the workspace, then run in the background:

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

Use the model ID from your system prompt (the one powering the current session) so the triggering test matches what the user actually experiences.

While it runs, periodically tail the output to give the user updates on which iteration it's on and what the scores look like.

This handles the full optimization loop automatically. It splits the eval set into 60% train and 40% held-out test, evaluates the current description (running each query 3 times to get a reliable trigger rate), then calls Claude to propose improvements based on what failed. It re-evaluates each new description on both train and test, iterating up to 5 times. When it's done, it opens an HTML report in the browser showing the results per iteration and returns JSON with `best_description` — selected by test score rather than train score to avoid overfitting.

**How triggering actually works** (for designing better eval queries): skills appear in Claude's `available_skills` list as name + description. Claude only consults a skill when the task can't be handled trivially — "read this PDF" won't fire even with a perfect description match, because Claude can just read the file. Substantive, multi-step, or specialized queries reliably trigger when the description matches. Keep eval queries substantive; trivial ones won't trigger regardless of description quality.

### Step 4: Apply the result

Take `best_description` from the JSON output and update the skill's SKILL.md frontmatter. Show the user before/after and report the scores.

---

### Package and Present (only if `present_files` tool is available)

Check whether you have access to the `present_files` tool. If you don't, skip this step. If you do, package the skill and present the .skill file to the user:

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

After packaging, direct the user to the resulting `.skill` file path so they can install it.

---

## Running on Claude.ai or in Cowork

The core workflow (draft → test → review → improve → repeat) is identical across platforms, but the mechanics differ when subagents or a browser aren't available. **If you're on Claude.ai or in Cowork, read `references/platform-specific.md`** — it covers what to adapt (running tests without subagents, the `--static` eval viewer, feedback via downloaded `feedback.json`, skipping benchmarks/blind-comparison, and updating installed skills). In standard Claude Code, you can ignore it and follow the workflow above as written.

---

## Reference files

The agents/ directory contains instructions for specialized subagents. Read them when you need to spawn the relevant subagent.

- `agents/grader.md` — How to evaluate assertions against outputs
- `agents/comparator.md` — How to do blind A/B comparison between two outputs
- `agents/analyzer.md` — How to analyze why one version beat another

The references/ directory has additional documentation:
- `references/schemas.md` — JSON structures for evals.json, grading.json, etc.
- `references/example-skills.md` — three annotated example SKILL.md files (simple / intermediate / complex) showing how to shape a skill by complexity
- `references/platform-specific.md` — Claude.ai- and Cowork-specific mechanics (read only when on those platforms)

---

## Composing with other skills

- **Grounding a new skill in current best practice** → invoke `autoresearch` first to triangulate sources; then encode the findings in the skill. Skills built from memory go stale fast.
- **Writing skill code (scripts in `scripts/`)** → use `superpowers:test-driven-development` for any non-trivial logic. Skills are code; treat them like code.
- **Multi-part skill work that can be parallelized** (e.g., drafting + grading + analyzing across many evals) → use `superpowers:dispatching-parallel-agents`.
- **UI-focused skills** → defer to the existing UI skills listed in the "UI / frontend skill design" section above before creating a competitor.

### Track the workflow as todos

Use `TodoWrite` to track the steps for whichever path you're on. The core loop:

1. Capture intent → draft skill
2. Run test prompts (Path A) or spawn parallel benchmark runs (Path B)
3. Review with the user
4. Edit the skill
5. Repeat until converged
6. (Optional) Run description optimization
7. (Optional) Package and present

If you're in Cowork, explicitly add "create eval JSON and run `eval-viewer/generate_review.py`" so it doesn't get forgotten.
