# Publish checklist: a research article leaves the studio only when every box is ticked

The export step (`site_export.py research <audit-folder>`) refuses to run while any item is open.

## Honesty
- [ ] The claim names **n**, units and the date measured.
- [ ] Variance is stated, or the text says n is too small to estimate it.
- [ ] A negative or null result is titled as one.
- [ ] "What this does not show" has at least two concrete limits.
- [ ] Every number in the summary card appears in the body with its source file.

## Reproducibility
- [ ] Commit hash of the studio code that produced the numbers.
- [ ] Pinned model names and versions; weights linked, never redistributed.
- [ ] `data/` holds the metrics and the ledger the tables were computed from, with sha256.
- [ ] The "Reproduce" commands were run once from a clean checkout.

## Scrub (private to public)
- [ ] No absolute paths (`D:\...`, `/Users/...`).
- [ ] No owner quotes, decision ids or casebook rows.
- [ ] No MiniMax-H3 clips or frame strips until the attorney's read is on file (metrics and hashes are fine).
- [ ] No third-party images without licence; cast portraits are ours.

## Page
- [ ] `item.json` validates (section, slug, kind, type, status, publishAt, version, claim, summary, measuredOn, license).
- [ ] `summary.png` exists (1200x630 safe area for OG).
- [ ] `paper.pdf` exported from the rendered page, sits next to it.
- [ ] Canonical URL, JSON-LD `ScholarlyArticle`, Google Scholar `citation_*` tags render (check the built HTML once).
- [ ] BibTeX block present; DOI filled in after the Zenodo release (or `null` on first publish, then version 1.0.1).

## Fan-out (tier 2 and up only)
- [ ] Folder pushed to `visurena-research`, `CITATION.cff` updated, GitHub release tagged `<slug>-v1.0.0`.
- [ ] Zenodo DOI minted; DOI written back into `item.json` and the cite block.
- [ ] Cross-post abstract (dev.to `canonical_url`, Medium import), optional.
