---
# Front-matter mirrors item.json for the fields the reader needs; item.json stays the source of truth.
title: "Denoise + Real-ESRGAN vs RTX VSR on anime video"
type: benchmark            # benchmark | negative-result | design-essay | note | system
date: 2026-10-27
version: 1.0.0
claim: "One sentence. The thing you would say in an interview."
---

<!-- The page header already shows the title, the headline number, the claim and "measured on"
     from item.json. Start the body with the question. -->

## Why this question
<!-- 3 to 5 sentences. What broke, what decision depended on the answer. -->

## Setup
- **Hardware / software:** pinned versions, commit hash
- **Inputs:** n = …, how chosen (random? all? the worst cases?)
- **Arms:** A = …, B = …
- **Metric(s):** name, how computed, why it is the right proxy
- **Pre-registered?** yes / no, with a link to PREREG.md if yes

## Results
| Arm | Metric 1 | Metric 2 | Cost |
|---|---|---|---|
| A | … ± … | … | … |
| B | … ± … | … | … |

<!-- One figure or the summary card. State variance; if n is too small to estimate it, say so. -->

## What this does not show
<!-- Limitations and threats to validity. Be the skeptic first. -->

## Decision taken
<!-- What changed in production because of this, with the date. -->

## Reproduce
```sh
git clone https://github.com/vishnusurya11/visurena-research
cd visurena-research/<slug>
uv run python measure.py --arm A --arm B
```
Data: `data/metrics.json`, `data/ledger.jsonl` (sha256 listed in `data/HASHES.txt`).

## How to cite
```bibtex
@misc{visurena2026upscale,
  author       = {ViSuReNa},
  title        = {Denoise + Real-ESRGAN vs RTX VSR on anime video},
  year         = {2026},
  month        = oct,
  version      = {1.0.0},
  doi          = {10.5281/zenodo.XXXXXXX},
  url          = {https://visurena.com/research/anime-upscale-ab-realesrgan-vs-rtx-vsr/}
}
```

## Changelog
- **1.0.0, 2026-10-27:** first publication.

<!-- License: text CC-BY-4.0, code Apache-2.0. Rendered automatically from item.json. -->
