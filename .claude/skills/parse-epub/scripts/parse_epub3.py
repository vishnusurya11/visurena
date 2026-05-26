#!/usr/bin/env python3
"""
EPUB 3 (and EPUB 2) parser using ebooklib + BeautifulSoup.

Use this for commercial / publisher / self-published EPUB 3 files where the
stdlib parser (parse_epub.py) returns 0 chapters or misses structure. It drives
chapter boundaries from the TOC (nav.xhtml / toc.ncx) and spine reading order,
which is authoritative — far more reliable than inferring chapters from HTML
class names.

Dependencies (not stdlib — install first):
    pip install EbookLib beautifulsoup4 lxml

Output matches parse_epub.py exactly:
    <output-dir>/<NN>-<slug>.json   per chapter
    <output-dir>/manifest.json      book-level summary

Usage:
    python3 parse_epub3.py path/to/book.epub [output-dir]

Docs:
    ebooklib   https://docs.sourcefabric.org/projects/ebooklib/en/latest/
    EPUB 3.3   https://www.w3.org/TR/epub-33/
"""
import json
import re
import sys
from pathlib import Path

try:
    import ebooklib
    from ebooklib import epub
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit(
        "Missing dependencies. Install with:\n"
        "    pip install EbookLib beautifulsoup4 lxml"
    )

# Front/back-matter epub:type values and title keywords that mark non-story sections.
NON_STORY_TYPES = {
    "frontmatter", "backmatter", "cover", "titlepage", "copyright-page",
    "dedication", "acknowledgments", "preface", "foreword", "epigraph",
    "toc", "colophon", "bibliography", "index", "glossary", "appendix",
}
NON_STORY_KEYWORDS = re.compile(
    r"\b(cover|title page|copyright|dedication|acknowledg|preface|foreword|"
    r"about the author|contents|colophon|appendix|index|glossary)\b",
    re.IGNORECASE,
)


def slugify(title: str, index: int) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    slug = slug[:50].rstrip("-") or "chapter"
    return f"{index:02d}-{slug}"


def extract_paragraphs(soup: BeautifulSoup) -> list[str]:
    """Pull readable paragraphs. Handles <p>, including EPUB 3 <p epub:type=...>."""
    paras = []
    for p in soup.find_all(["p", "blockquote"]):
        text = " ".join(p.get_text(separator=" ").split())
        if text:
            paras.append(text)
    # Fallback: some EPUB 3 books wrap prose in <div> not <p>.
    if not paras:
        for div in soup.find_all("div"):
            text = " ".join(div.get_text(separator=" ").split())
            if text and len(text) > 40:
                paras.append(text)
    return paras


def section_type(soup: BeautifulSoup, title: str) -> str:
    """Classify story vs needs_review using epub:type then title heuristics."""
    for el in soup.find_all(attrs={"epub:type": True}):
        for t in el["epub:type"].split():
            if t.lower() in NON_STORY_TYPES:
                return "needs_review"
    body = soup.find("body")
    if body and body.has_attr("epub:type"):
        for t in body["epub:type"].split():
            if t.lower() in NON_STORY_TYPES:
                return "needs_review"
    if NON_STORY_KEYWORDS.search(title or ""):
        return "needs_review"
    return "story"


def toc_titles(book: epub.EpubBook) -> dict[str, str]:
    """Map content-file href -> chapter title from the TOC (authoritative)."""
    titles: dict[str, str] = {}

    def walk(items):
        for item in items:
            if isinstance(item, tuple):  # (Section, [children])
                walk(item[1])
            elif isinstance(item, epub.Link):
                href = item.href.split("#")[0]
                titles.setdefault(href, item.title)

    walk(book.toc)
    return titles


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 parse_epub3.py <book.epub> [output-dir]")

    epub_path = Path(sys.argv[1])
    if not epub_path.exists():
        sys.exit(f"File not found: {epub_path}")

    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else epub_path.parent / "parsed"
    out_dir.mkdir(parents=True, exist_ok=True)

    book = epub.read_epub(str(epub_path))

    title = (book.get_metadata("DC", "title") or [["Unknown"]])[0][0]
    creator = (book.get_metadata("DC", "creator") or [["Unknown"]])[0][0]
    nav_titles = toc_titles(book)

    chapters = []
    index = 0
    # book.spine is the reading order: list of (idref, linear) tuples.
    for idref, _linear in book.spine:
        item = book.get_item_with_id(idref)
        if item is None or item.get_type() != ebooklib.ITEM_DOCUMENT:
            continue
        soup = BeautifulSoup(item.get_content(), "lxml")
        paras = extract_paragraphs(soup)
        if not paras:
            continue  # nav docs, empty pages, etc.

        index += 1
        href = item.get_name()
        ch_title = (
            nav_titles.get(href)
            or (soup.find(["h1", "h2", "h3"]).get_text(strip=True)
                if soup.find(["h1", "h2", "h3"]) else None)
            or f"Chapter {index}"
        )
        ctype = section_type(soup, ch_title)
        word_count = sum(len(p.split()) for p in paras)

        filename = f"{slugify(ch_title, index)}.json"
        chapter = {
            "title": ch_title,
            "type": ctype,
            "paragraphs": paras,
            "wordCount": word_count,
            "paragraphCount": len(paras),
        }
        (out_dir / filename).write_text(json.dumps(chapter, indent=2, ensure_ascii=False))
        print(f"{filename}  [{ctype}]  {word_count} words  {len(paras)} paragraphs")
        chapters.append({
            "filename": filename,
            "title": ch_title,
            "type": ctype,
            "wordCount": word_count,
            "paragraphCount": len(paras),
        })

    manifest = {
        "source": str(epub_path.resolve()),
        "title": title,
        "creator": creator,
        "totalChapters": len(chapters),
        "totalWords": sum(c["wordCount"] for c in chapters),
        "chapters": chapters,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    story = sum(1 for c in chapters if c["type"] == "story")
    print(f"\nDone: {story} story chapters ({len(chapters)} total), "
          f"{manifest['totalWords']} words -> {out_dir}")


if __name__ == "__main__":
    main()
