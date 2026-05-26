---
name: parse-epub
description: >
  Parse any EPUB file (Project Gutenberg, commercial, or self-published) into
  per-chapter JSON files with paragraph-level content, word counts, and a manifest.
  Use when the user provides an EPUB path and says "parse", "extract chapters",
  "convert epub", "extract text from ebook", or wants structured JSON from any
  .epub file. Trigger whenever a .epub file path is mentioned alongside any
  extraction or processing intent, even if the user doesn't say "parse" explicitly.
  Also trigger for ebook text extraction, chapter splitting, or epub-to-JSON tasks.
argument-hint: <path-to-epub>
allowed-tools:
  - Bash(python3:*)
  - Bash(pip:*)
  - Bash(pip3:*)
  - Bash(ls:*)
  - Bash(unzip:*)
  - Read
---

# Parse EPUB

Extract chapters from any EPUB file (EPUB 2 or EPUB 3) into individual JSON files with paragraph-level content, word counts, and chapter classification.

## Two parsers — pick by EPUB type

| Script | Dependencies | Best for | Chapter detection |
|---|---|---|---|
| `scripts/parse_epub.py` | **stdlib only** (`zipfile`, `xml.etree`, `html.parser`) | Project Gutenberg & EPUB 2 | HTML `div.chapter` / heading heuristics |
| `scripts/parse_epub3.py` | `pip install EbookLib beautifulsoup4 lxml` | **Commercial / publisher / self-published EPUB 3** | TOC (`nav.xhtml`/`toc.ncx`) + spine order — authoritative |

**Default:** try the stdlib parser first (no install, fast). If it returns **0 chapters** or obviously wrong structure, the file is almost certainly EPUB 3 — switch to `parse_epub3.py`. Both write the **identical JSON output format** (per-chapter files + `manifest.json`), so downstream code doesn't change.

The ebooklib path is the *real* EPUB 3 solution: it reads `book.spine` for reading order and `book.toc` for chapter titles, handles `<p epub:type="...">`, and classifies front/back-matter via `epub:type` (frontmatter/backmatter/cover/etc.) rather than guessing from class names.

## Input

`$ARGUMENTS` is the path to an `.epub` file, optionally followed by an output directory.

```
/parse-epub data/pg108/source/pg108.epub
/parse-epub data/pg108/source/pg108.epub data/pg108/parsed
```

Output defaults to `parsed/` inside the same directory as the EPUB if no output dir is given.

## Steps

1. **Validate the file exists**
   ```bash
   ls "$ARGUMENTS"
   ```
   If the file is missing, tell the user and stop.

2. **Run the parser** (start with stdlib; fall back to ebooklib for EPUB 3)
   ```bash
   # Default: Gutenberg / EPUB 2 — no install needed
   python3 ${CLAUDE_SKILL_DIR}/scripts/parse_epub.py $ARGUMENTS
   ```
   The script prints each chapter filename, word count, and paragraph count as it writes them, then a summary line.

   If it reports **0 chapters** (EPUB 3 / commercial file), switch to the ebooklib parser:
   ```bash
   pip install EbookLib beautifulsoup4 lxml
   python3 ${CLAUDE_SKILL_DIR}/scripts/parse_epub3.py $ARGUMENTS
   ```
   Same output format, but driven by the TOC + spine so it handles EPUB 3 semantic markup correctly.

3. **Read and display the manifest**
   Read `<epub-dir>/parsed/manifest.json` (or the custom output dir if provided) and show the user:
   - Book title and creator
   - Total chapters and total word count
   - Any chapters flagged as `needs_review`

4. **Report results**
   Summarize in one sentence: how many story chapters were extracted, total words, and the output path.

## Output Format

### Per-chapter JSON (`<output-dir>/<NN>-<slug>.json`)
```json
{
  "title": "THE GOLDEN BIRD",
  "type": "story",
  "paragraphs": ["paragraph 1...", "paragraph 2..."],
  "wordCount": 2527,
  "paragraphCount": 19
}
```

`type` is either `"story"` or `"needs_review"`. Chapters flagged `needs_review` are frontmatter/back-matter (prefaces, dedications, introductions, very short closing remarks) that likely shouldn't be treated as story content.

### Manifest (`<output-dir>/manifest.json`)
```json
{
  "source": "/absolute/path/to/book.epub",
  "title": "Book Title",
  "creator": "Author Name",
  "totalChapters": 62,
  "totalWords": 100613,
  "chapters": [
    {
      "filename": "01-the-golden-bird.json",
      "title": "THE GOLDEN BIRD",
      "type": "story",
      "wordCount": 2527,
      "paragraphCount": 19
    }
  ]
}
```

## Real-world example outputs

### Project Gutenberg (EPUB 2) — *Grimm's Fairy Tales* (pg2591), stdlib parser

`manifest.json` (truncated):
```json
{
  "source": "/data/pg2591/source/pg2591.epub",
  "title": "Grimms' Fairy Tales",
  "creator": "Jacob Grimm and Wilhelm Grimm",
  "totalChapters": 64,
  "totalWords": 102443,
  "chapters": [
    { "filename": "01-the-golden-bird.json", "title": "THE GOLDEN BIRD", "type": "story", "wordCount": 2527, "paragraphCount": 19 },
    { "filename": "02-hans-in-luck.json",    "title": "HANS IN LUCK",    "type": "story", "wordCount": 2043, "paragraphCount": 31 }
  ]
}
```
`01-the-golden-bird.json`:
```json
{
  "title": "THE GOLDEN BIRD",
  "type": "story",
  "paragraphs": [
    "A certain king had a beautiful garden, and in the garden stood a tree which bore golden apples.",
    "These apples were always counted, and about the time when they began to grow ripe it was found that every night one of them was gone."
  ],
  "wordCount": 2527,
  "paragraphCount": 19
}
```
Note the leading Gutenberg boilerplate (`*** START OF ...`, `Produced by ...`) is stripped automatically.

### Commercial EPUB 3 — publisher novel, ebooklib parser

A typical publisher EPUB 3 uses `<section epub:type="bodymatter chapter">` and a `nav.xhtml` TOC. `parse_epub3.py` produces:

`manifest.json` (truncated):
```json
{
  "source": "/books/the-silent-tide/the-silent-tide.epub",
  "title": "The Silent Tide",
  "creator": "A. N. Author",
  "totalChapters": 24,
  "totalWords": 91860,
  "chapters": [
    { "filename": "01-cover.json",       "title": "Cover",       "type": "needs_review", "wordCount": 3,    "paragraphCount": 1 },
    { "filename": "02-title-page.json",  "title": "Title Page",  "type": "needs_review", "wordCount": 11,   "paragraphCount": 2 },
    { "filename": "03-chapter-one.json", "title": "Chapter One", "type": "story",        "wordCount": 4112, "paragraphCount": 58 }
  ]
}
```
`03-chapter-one.json`:
```json
{
  "title": "Chapter One",
  "type": "story",
  "paragraphs": [
    "The harbour had been quiet for three days, which everyone agreed was a bad sign.",
    "Mara pulled her coat tighter and watched the grey water refuse to move."
  ],
  "wordCount": 4112,
  "paragraphCount": 58
}
```
Front-matter (`Cover`, `Title Page`, copyright) is flagged `needs_review` via `epub:type`; real chapters come through as `story` with titles pulled from the TOC. (Illustrative values; exact counts depend on the book.)

## How the Parser Works

The bundled script uses three strategies, tried in order:

1. **`div.chapter` strategy** — looks for `<div class="chapter">` blocks. Standard Gutenberg EPUB 2 structure.
2. **Heading fallback** — splits on `<h1>`–`<h4>` tags when no `div.chapter` found.
3. **Boilerplate stripping** — removes Project Gutenberg header/footer text (`*** START OF`, `Produced by`, `*** END OF`) from first/last chapters.

### EPUB 2 vs EPUB 3

The bundled script targets **EPUB 2** (Gutenberg format). **EPUB 3** — used by commercial ebooks (Amazon KFX converted, publisher epubs, Apple Books) — has a different structure:

| | EPUB 2 | EPUB 3 |
|---|---|---|
| Chapter markup | `<div class="chapter">` | `<section epub:type="chapter">` |
| Navigation | `toc.ncx` (XML) | `nav.xhtml` (HTML `<nav>`) |
| Frontmatter | Convention only | `epub:type="frontmatter"` |
| Backmatter | Convention only | `epub:type="backmatter"` |

If you're parsing a **commercial EPUB 3** file and getting 0 chapters, the HTML structure won't have `div.chapter`. The correct chapter boundaries are in the `nav.xhtml` TOC — which the bundled script doesn't read. See the Non-Gutenberg EPUBs section below.

## Non-Gutenberg EPUBs

For commercial or EPUB 3 files, the bundled script may produce 0 chapters or miss structure. Better approach:

### Inspect the EPUB first
```bash
# List all files inside the EPUB
unzip -l book.epub

# Find the navigation document
unzip -p book.epub "**nav**" 2>/dev/null | head -60
# or for EPUB 2:
unzip -p book.epub toc.ncx 2>/dev/null | head -60

# Inspect a content file's actual markup
unzip -p book.epub OEBPS/chapter01.xhtml | head -80
```

### EPUB 3 semantic markers to look for
```bash
# Check if it's EPUB 3 with semantic chapter markup
unzip -p book.epub OEBPS/content.opf | grep "version="
unzip -p book.epub OEBPS/chapter01.xhtml | grep "epub:type"
```

If you see `epub:type="chapter"` (or version `3.x` in `content.opf`), **use the bundled ebooklib parser** — it already handles all of this:

```bash
pip install EbookLib beautifulsoup4 lxml
python3 ${CLAUDE_SKILL_DIR}/scripts/parse_epub3.py book.epub
```

It iterates `book.spine` (reading order), reads chapter titles from `book.toc`, extracts `<p>` (including `<p epub:type="...">`), and classifies front/back-matter via `epub:type`. Only write custom extraction if the bundled script can't handle a truly unusual file. The core ebooklib calls it uses, for reference:

```python
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

book = epub.read_epub('book.epub')
for idref, _linear in book.spine:                       # reading order
    item = book.get_item_with_id(idref)
    if item.get_type() != ebooklib.ITEM_DOCUMENT:
        continue
    soup = BeautifulSoup(item.get_content(), 'lxml')
    paras = [p.get_text(' ', strip=True) for p in soup.find_all('p')]
```

### Reliable chapter structure via TOC
The `nav.xhtml` (EPUB 3) or `toc.ncx` (EPUB 2) defines the actual table of contents — it's more reliable than inferring chapters from HTML markup. Use it when the HTML structure is unclear:

```bash
# EPUB 3 nav
unzip -p book.epub $(unzip -l book.epub | grep nav.xhtml | awk '{print $4}')

# EPUB 2 NCX  
unzip -p book.epub $(unzip -l book.epub | grep toc.ncx | awk '{print $4}')
```

The TOC gives you chapter titles and which content file each chapter starts in — use this to drive extraction rather than HTML structure inference.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `0 chapters detected` | EPUB 3 or non-Gutenberg structure | Inspect with `unzip -l book.epub`, check for `epub:type="chapter"` or `nav.xhtml` — use ebooklib approach |
| `0 chapters detected` | Both strategies failed on EPUB 2 | Inspect XHTML manually with `unzip -p book.epub <spine-file>`, update `scripts/parse_epub.py` |
| Chapters out of order | HTML parsed by file name, not spine order | The spine in `content.opf` defines reading order — check it: `unzip -p book.epub OEBPS/content.opf` |
| Many `needs_review` chapters | Lots of front/back matter | Expected; filter by `"type": "story"` in downstream code |
| Missing paragraphs | Content inside `<div class="center">` | Currently skipped as boilerplate; adjust `_skip_p` logic in the parser |
| Missing paragraphs | EPUB 3 uses `<p epub:type="...">` | Bundled parser doesn't handle epub:type on paragraphs — use ebooklib |
| `KeyError` on a spine file | Malformed EPUB zip entries | The script skips missing entries and continues |
| Wrong title/creator in manifest | EPUB metadata in different namespace | Check `content.opf` directly: `unzip -p book.epub OEBPS/content.opf \| grep -E "title\|creator"` |
| `ImportError` running `parse_epub3.py` | ebooklib not installed | `pip install EbookLib beautifulsoup4 lxml` (the package is `EbookLib`, imported as `ebooklib`) |
| EPUB 3 chapters split mid-chapter | One logical chapter spans multiple spine files, or TOC deep-links with `#fragment` | The TOC entry's fragment marks the real boundary; merge spine files that share a chapter, or split on the fragment anchor |
| DRM-protected EPUB | Adobe ADEPT / Apple FairPlay encryption | Out of scope — these can't be parsed without removing DRM, which is generally not lawful. Stop and tell the user |

## References

- **W3C EPUB 3.3** (current Recommendation; the authoritative EPUB 3 spec) — https://www.w3.org/TR/epub-33/
- **W3C EPUB Reading Systems 3.3** (how readers interpret EPUBs) — https://www.w3.org/TR/epub-rs-33/
- **W3C EPUB Accessibility 1.1** — https://www.w3.org/TR/epub-a11y-11/
- **EbookLib** (Python EPUB 2/3 read+write library; powers `parse_epub3.py`) — repo: https://github.com/aerkalov/ebooklib · docs: https://docs.sourcefabric.org/projects/ebooklib/en/latest/ · PyPI (package name `EbookLib`): https://pypi.org/project/EbookLib/
- **BeautifulSoup** (HTML parsing) — https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- **Project Gutenberg** (free EPUB 2 test files) — https://www.gutenberg.org/ · per-book pages expose `.epub` downloads, e.g. https://www.gutenberg.org/ebooks/2591

Version notes (as of May 2026): EPUB 3.3 became a W3C Recommendation in May 2023 (re-published 2025); it is the current standard. EbookLib's latest published line is 0.x (0.20). Confirm the installed EbookLib version if behavior differs.
