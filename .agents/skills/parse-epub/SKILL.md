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
  - Bash(ls:*)
  - Bash(unzip:*)
  - Read
---

# Parse EPUB

Extract chapters from any EPUB file (EPUB 2 or EPUB 3) into individual JSON files with paragraph-level content, word counts, and chapter classification.

## Dependencies

No external packages required — the script uses only Python 3 stdlib (`zipfile`, `xml.etree.ElementTree`, `html.parser`).

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

2. **Run the parser**
   ```bash
   python3 ${CLAUDE_SKILL_DIR}/scripts/parse_epub.py $ARGUMENTS
   ```
   The script will print each chapter filename, word count, and paragraph count as it writes them, then a summary line.

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

If you see `epub:type="chapter"`, the bundled script won't find those chapters. Write a targeted extraction using `ebooklib`:

```python
# pip install ebooklib beautifulsoup4
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

book = epub.read_epub('book.epub')
for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
    soup = BeautifulSoup(item.get_content(), 'html.parser')
    # EPUB 3: find by epub:type
    chapters = soup.find_all(attrs={'epub:type': 'chapter'})
    # or by semantic section
    chapters = soup.find_all('section')
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
