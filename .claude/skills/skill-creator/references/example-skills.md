# Example SKILL.md Files (Annotated)

Three reference skills at increasing complexity. Each shows a complete, well-formed `SKILL.md` followed by notes on *why* it's structured that way. Use them as templates — match the shape to the skill's complexity, don't over-build a simple skill.

The progression:
- **Simple** — pure SKILL.md, no bundled resources. Most skills should start here.
- **Intermediate** — SKILL.md + one bundled script (deterministic work offloaded to code).
- **Complex** — SKILL.md as a router + multiple `references/` files (progressive disclosure for a multi-variant domain).

---

## 1. Simple — `commit-message` (SKILL.md only)

A skill that's just instructions. No scripts, no references. The whole thing fits in the body.

```markdown
---
name: commit-message
description: >
  Write a clear, conventional git commit message from staged changes. Use when
  the user asks to "write a commit message", "commit this", or after making
  changes and they want to commit. Trigger whenever the user is about to commit
  and hasn't dictated the exact message themselves.
---

# Commit Message

Generate a Conventional Commits message from the staged diff.

## Steps
1. Run `git diff --staged` to see what's being committed. If nothing is staged,
   tell the user and stop.
2. Determine the type: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
3. Write a one-line summary in the imperative mood, ≤ 72 chars, no trailing period.
4. If the change is non-trivial, add a body explaining *why* (not *what* — the
   diff shows what).

## Format
ALWAYS use this structure:
```
<type>(<optional scope>): <imperative summary>

<optional body explaining why>
```

## Examples
**Example 1:**
Input: Added JWT validation to the auth middleware
Output: `feat(auth): validate JWT on protected routes`

**Example 2:**
Input: Fixed a crash when the cart is empty at checkout
Output: `fix(cart): guard against empty cart at checkout`
```

**Why it's shaped this way:**
- **Description is "pushy"** — names concrete trigger phrases *and* the implicit case ("about to commit and hasn't dictated the message"). Skills under-trigger by default; the description fights that.
- **No bundled files** — there's no deterministic/repetitive work to offload and no doc too long for the body. Adding a `scripts/` folder here would be over-engineering.
- **Imperative steps + explicit output format** — the model knows exactly what to produce.
- **Examples use Input/Output pairs** — the fastest way to pin down a format.

---

## 2. Intermediate — `csv-profile` (SKILL.md + bundled script)

When the same deterministic work would otherwise be re-derived on every invocation, bundle it as a script and have the skill call it.

```markdown
---
name: csv-profile
description: >
  Profile a CSV file — row/column counts, per-column types, null rates, and
  basic stats — and return a summary. Use when the user points at a .csv and
  asks to "profile", "summarize", "describe", "explore", or "understand" it, or
  asks what's in a dataset. Trigger whenever a .csv path appears with any
  intent to inspect or understand the data, even without the word "profile".
argument-hint: <path-to-csv>
allowed-tools:
  - Bash(python3:*)
  - Read
---

# CSV Profile

Produce a structured profile of a CSV using the bundled script.

## Steps
1. Confirm the file exists. If not, tell the user and stop.
2. Run the profiler:
   ```bash
   python3 ${CLAUDE_SKILL_DIR}/scripts/profile_csv.py "$ARGUMENTS"
   ```
   It prints JSON: shape, per-column dtype, null %, and numeric summaries.
3. Read the JSON and present a short narrative summary: shape, any columns with
   high null rates (> 20%), and anything notable (constant columns, likely IDs,
   suspected dates stored as strings).

## Output
Lead with one sentence (rows × columns, overall data health), then a compact
per-column table. Flag data-quality issues explicitly — that's the value.
```

**Why it's shaped this way:**
- **The script does the deterministic part** (parsing, counting, stats) so the model never re-implements pandas logic ad hoc. The body handles judgment (narrative, flagging issues) — the part that actually needs a model.
- **`${CLAUDE_SKILL_DIR}`** resolves to the skill's own folder, so the script path works regardless of CWD.
- **`allowed-tools`** is scoped tightly to what the skill needs.
- **`argument-hint`** documents the expected argument for the user.
- Signal for bundling a script: *if you noticed every test run independently wrote a near-identical helper, write it once and ship it.*

---

## 3. Complex — `cloud-deploy` (SKILL.md as router + references/)

A multi-variant domain. The SKILL.md stays short and routes to one reference file per variant — progressive disclosure: the model loads only the reference it needs.

Folder:
```
cloud-deploy/
├── SKILL.md           (workflow + which-reference selection)
└── references/
    ├── aws.md         (ECS/Fargate specifics)
    ├── gcp.md         (Cloud Run specifics)
    └── azure.md       (Container Apps specifics)
```

```markdown
---
name: cloud-deploy
description: >
  Deploy a containerized app to AWS, GCP, or Azure. Use when the user wants to
  deploy, ship, or release a container/service to the cloud, mentions ECS,
  Fargate, Cloud Run, or Azure Container Apps, or asks how to get their app
  "live" / "into production" on a cloud provider. Trigger on deployment intent
  even if the provider isn't named yet — ask which one.
---

# Cloud Deploy

Deploy a containerized app to a cloud provider. This skill covers the shared
workflow and routes to provider-specific detail.

## Shared workflow (all providers)
1. Confirm a working Dockerfile and that the image builds locally.
2. Identify the target provider. If unspecified, ask: AWS, GCP, or Azure?
3. Read the matching reference file below for provider-specific steps.
4. Build & push the image, provision the service, deploy, verify health, return
   the public URL.

## Provider references — read ONLY the one you need
- **AWS** (ECS / Fargate): `references/aws.md`
- **GCP** (Cloud Run): `references/gcp.md`
- **Azure** (Container Apps): `references/azure.md`

## Verification (all providers)
After deploy, hit the health endpoint and confirm a 200 before reporting success.
Never claim "deployed" without observing a healthy response.
```

**Why it's shaped this way:**
- **The body is a router, not an encyclopedia.** Provider details live in `references/*.md` and are loaded on demand. This keeps the always-loaded body small while supporting unlimited per-variant depth.
- **"read ONLY the one you need"** tells the model not to pull all three references into context.
- **Shared workflow + per-variant references** is the canonical pattern for any skill spanning multiple frameworks/clouds/languages.
- For a reference file over ~300 lines, add a table of contents at its top.

---

## Choosing the right shape

| Signal | Shape |
|---|---|
| All instructions fit comfortably in the body; no repeated deterministic work | **Simple** (SKILL.md only) |
| There's deterministic/repetitive work every run would otherwise redo | **Intermediate** (+ `scripts/`) |
| The skill spans multiple variants, or has docs too long for the body | **Complex** (+ `references/`) |

Don't reach for the complex shape prematurely. A 60-line SKILL.md that works beats a directory tree that impresses.
