#!/usr/bin/env python3
"""Parse a Project Gutenberg EPUB into per-chapter/story JSON files."""

import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path


# ---------------------------------------------------------------------------
# OPF / spine helpers
# ---------------------------------------------------------------------------

def extract_opf_path(zf: zipfile.ZipFile) -> str:
    """Read META-INF/container.xml and return the OPF file path."""
    container = zf.read("META-INF/container.xml").decode("utf-8")
    root = ET.fromstring(container)
    ns = {"c": "urn:oasis:names:tc:opendocument:xmlns:container"}
    rootfile = root.find(".//c:rootfile", ns)
    return rootfile.attrib["full-path"]


def parse_metadata(zf: zipfile.ZipFile, opf_path: str) -> dict:
    """Extract title, creator, and book ID from the OPF package."""
    opf_xml = zf.read(opf_path).decode("utf-8")
    root = ET.fromstring(opf_xml)
    ns = {
        "opf": "http://www.idpf.org/2007/opf",
        "dc": "http://purl.org/dc/elements/1.1/",
    }

    title_el = root.find(".//dc:title", ns)
    title = title_el.text.strip() if title_el is not None and title_el.text else "Unknown"

    creator_el = root.find(".//dc:creator", ns)
    creator = creator_el.text.strip() if creator_el is not None and creator_el.text else "Unknown"

    identifier_el = root.find(".//dc:identifier", ns)
    book_id = ""
    if identifier_el is not None and identifier_el.text:
        m = re.search(r"gutenberg\.org/(\d+)", identifier_el.text)
        if m:
            book_id = f"pg{m.group(1)}"

    return {"title": title, "creator": creator, "book_id": book_id}


def get_spine_items(zf: zipfile.ZipFile, opf_path: str) -> list[str]:
    """Return ordered list of content XHTML hrefs from the OPF spine."""
    opf_xml = zf.read(opf_path).decode("utf-8")
    root = ET.fromstring(opf_xml)
    ns = {"opf": "http://www.idpf.org/2007/opf"}

    # Build id -> (href, media-type) map from <manifest>
    manifest = {}
    for item in root.findall(".//{http://www.idpf.org/2007/opf}item"):
        manifest[item.attrib["id"]] = (
            item.attrib["href"],
            item.attrib.get("media-type", ""),
        )

    # Read spine order
    opf_dir = os.path.dirname(opf_path)
    hrefs = []
    for itemref in root.findall(".//{http://www.idpf.org/2007/opf}itemref"):
        idref = itemref.attrib["idref"]
        if idref in manifest:
            href, media = manifest[idref]
            if "xhtml" in media or "html" in media:
                full = os.path.join(opf_dir, href) if opf_dir else href
                hrefs.append(full)
    return hrefs


# ---------------------------------------------------------------------------
# HTML content parser
# ---------------------------------------------------------------------------

class EpubChapterParser(HTMLParser):
    """Extract chapters from a Gutenberg EPUB XHTML file.

    Each chapter is a dict: {"title": str, "paragraphs": [str, ...]}
    """

    HEADING_TAGS = {"h1", "h2", "h3", "h4"}

    def __init__(self):
        super().__init__()
        self.chapters: list[dict] = []
        self.in_boilerplate = False
        self.in_chapter = 0          # nesting depth inside div.chapter
        self.in_heading = False
        self.in_paragraph = False
        self.current_title = ""
        self.current_paragraph = ""
        self.current_paragraphs: list[str] = []
        self._div_depth = 0          # track div nesting inside a chapter
        self._skip_p = False         # skip paragraphs with class "center" containing THE END etc.

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        attr_dict = dict(attrs)
        classes = (attr_dict.get("class") or "").split()

        # Boilerplate sections
        if tag == "section" and "pg-boilerplate" in classes:
            self.in_boilerplate = True
            return

        if self.in_boilerplate:
            return

        # Chapter div
        if tag == "div" and "chapter" in classes:
            if self.in_chapter > 0:
                # Finish previous chapter
                self._finish_chapter()
            self.in_chapter = 1
            self._div_depth = 0
            self.current_title = ""
            self.current_paragraphs = []
            return

        if self.in_chapter > 0:
            if tag == "div":
                self._div_depth += 1

            if tag in self.HEADING_TAGS and not self.current_title:
                self.in_heading = True
                self.current_title = ""

            if tag == "p":
                self.in_paragraph = True
                self.current_paragraph = ""
                # Check for "center" class with THE END type content
                self._skip_p = "center" in classes

    def handle_endtag(self, tag: str):
        if tag == "section" and self.in_boilerplate:
            self.in_boilerplate = False
            return

        if self.in_boilerplate:
            return

        if self.in_chapter > 0:
            if tag in self.HEADING_TAGS and self.in_heading:
                self.in_heading = False
                self.current_title = _clean_text(self.current_title)

            if tag == "p" and self.in_paragraph:
                self.in_paragraph = False
                text = _clean_text(self.current_paragraph)
                if text and not self._skip_p:
                    self.current_paragraphs.append(text)
                self._skip_p = False

            if tag == "div":
                if self._div_depth > 0:
                    self._div_depth -= 1

    def handle_data(self, data: str):
        if self.in_boilerplate:
            return
        if self.in_heading:
            self.current_title += data
        elif self.in_paragraph:
            self.current_paragraph += data

    def handle_entityref(self, name: str):
        from html import unescape
        char = unescape(f"&{name};")
        if self.in_heading:
            self.current_title += char
        elif self.in_paragraph:
            self.current_paragraph += char

    def handle_charref(self, name: str):
        from html import unescape
        char = unescape(f"&#{name};")
        if self.in_heading:
            self.current_title += char
        elif self.in_paragraph:
            self.current_paragraph += char

    def _finish_chapter(self):
        title = self.current_title.strip()
        paragraphs = [p for p in self.current_paragraphs if p]
        if title or paragraphs:
            self.chapters.append({"title": title, "paragraphs": paragraphs})

    def close(self):
        # Finish the last chapter if one is open
        if self.in_chapter > 0:
            self._finish_chapter()
            self.in_chapter = 0
        super().close()


# ---------------------------------------------------------------------------
# Fallback: heading-based splitting (no div.chapter)
# ---------------------------------------------------------------------------

class HeadingSplitParser(HTMLParser):
    """Fallback parser that splits on heading tags when no div.chapter exists."""

    HEADING_TAGS = {"h1", "h2", "h3", "h4"}

    def __init__(self):
        super().__init__()
        self.chapters: list[dict] = []
        self.in_boilerplate = False
        self.in_heading = False
        self.in_paragraph = False
        self.current_title = ""
        self.current_paragraph = ""
        self.current_paragraphs: list[str] = []
        self._started = False

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        classes = (attr_dict.get("class") or "").split()

        if tag == "section" and "pg-boilerplate" in classes:
            self.in_boilerplate = True
            return
        if self.in_boilerplate:
            return

        if tag in self.HEADING_TAGS:
            # New chapter boundary
            if self._started and self.current_paragraphs:
                self.chapters.append({
                    "title": _clean_text(self.current_title),
                    "paragraphs": list(self.current_paragraphs),
                })
            self.in_heading = True
            self.current_title = ""
            self.current_paragraphs = []
            self._started = True

        if tag == "p" and self._started:
            self.in_paragraph = True
            self.current_paragraph = ""

    def handle_endtag(self, tag):
        if tag == "section" and self.in_boilerplate:
            self.in_boilerplate = False
            return
        if self.in_boilerplate:
            return

        if tag in self.HEADING_TAGS and self.in_heading:
            self.in_heading = False

        if tag == "p" and self.in_paragraph:
            self.in_paragraph = False
            text = _clean_text(self.current_paragraph)
            if text:
                self.current_paragraphs.append(text)

    def handle_data(self, data):
        if self.in_boilerplate:
            return
        if self.in_heading:
            self.current_title += data
        elif self.in_paragraph:
            self.current_paragraph += data

    def close(self):
        if self._started and self.current_paragraphs:
            self.chapters.append({
                "title": _clean_text(self.current_title),
                "paragraphs": list(self.current_paragraphs),
            })
        super().close()


# ---------------------------------------------------------------------------
# Extraction orchestrator
# ---------------------------------------------------------------------------

def _clean_text(text: str) -> str:
    """Collapse whitespace, strip edges."""
    return re.sub(r"\s+", " ", text).strip()


def extract_chapters(zf: zipfile.ZipFile, spine_hrefs: list[str]) -> list[dict]:
    """Parse all spine XHTML files and return a list of chapters."""
    all_chapters: list[dict] = []
    use_fallback = False

    # First pass: try div.chapter parsing
    for href in spine_hrefs:
        try:
            content = zf.read(href).decode("utf-8")
        except KeyError:
            continue

        parser = EpubChapterParser()
        parser.feed(content)
        parser.close()
        all_chapters.extend(parser.chapters)

    # If no chapters found, try fallback heading-based splitting
    if not all_chapters:
        use_fallback = True
        for href in spine_hrefs:
            try:
                content = zf.read(href).decode("utf-8")
            except KeyError:
                continue
            parser = HeadingSplitParser()
            parser.feed(content)
            parser.close()
            all_chapters.extend(parser.chapters)

    return all_chapters


def strip_gutenberg(chapters: list[dict]) -> list[dict]:
    """Remove residual Gutenberg boilerplate from first/last chapters."""
    if not chapters:
        return chapters

    gutenberg_start = re.compile(
        r"(Produced by|PREPARER'S NOTE|Online Distributed Proofreading|"
        r"\*\*\* START OF)",
        re.IGNORECASE,
    )
    gutenberg_end = re.compile(
        r"(End of .*Project Gutenberg|\*\*\* END OF)",
        re.IGNORECASE,
    )

    # Strip leading boilerplate paragraphs from first chapter
    first = chapters[0]
    while first["paragraphs"] and gutenberg_start.search(first["paragraphs"][0]):
        first["paragraphs"].pop(0)

    # Strip trailing boilerplate paragraphs from last chapter
    last = chapters[-1]
    while last["paragraphs"] and gutenberg_end.search(last["paragraphs"][-1]):
        last["paragraphs"].pop()

    # Remove chapters left with no paragraphs
    chapters = [c for c in chapters if c["paragraphs"]]

    return chapters


# ---------------------------------------------------------------------------
# Filename generation
# ---------------------------------------------------------------------------

def title_to_filename(title: str, index: int, total: int) -> str:
    """Generate a clean filename from a chapter title."""
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug.strip())
    slug = re.sub(r"-+", "-", slug)
    slug = slug[:60].rstrip("-")

    if not slug:
        slug = f"chapter-{index + 1}"

    pad = len(str(total))
    if pad < 2:
        pad = 2
    prefix = str(index + 1).zfill(pad)
    return f"{prefix}-{slug}.json"


# ---------------------------------------------------------------------------
# Chapter classification
# ---------------------------------------------------------------------------

NON_STORY_TITLES = {
    "preface", "foreword", "introduction", "contents", "prologue",
    "editor's note", "editors note", "acknowledgements", "acknowledgments",
    "dedication", "about the author", "notes", "appendix", "bibliography",
    "glossary", "index", "epilogue", "afterword", "colophon",
    "to the reader", "translator's note", "translators note",
}

NON_STORY_KEYWORDS = {
    "preface", "foreword", "introduction", "history of", "editor",
    "dedication", "note on", "translator",
}

# Word threshold below which a chapter is suspect
MIN_WORDS_SUSPECT = 30


def classify_chapter(chapter: dict, index: int, total: int) -> str:
    """Classify a chapter as 'story' or 'needs_review'.

    Returns one of: 'story', 'needs_review'
    """
    title = chapter.get("title", "").strip()
    title_lower = title.lower()
    word_count = sum(len(p.split()) for p in chapter["paragraphs"])
    paragraphs = chapter.get("paragraphs", [])

    # No title and very few words — likely a closing remark or artifact
    if not title and word_count < MIN_WORDS_SUSPECT:
        return "needs_review"

    # Known non-story titles
    if title_lower in NON_STORY_TITLES:
        return "needs_review"

    # Partial match for non-story titles (e.g., "A SHORT HISTORY OF...")
    if any(kw in title_lower for kw in NON_STORY_KEYWORDS):
        return "needs_review"

    # Dedication pattern: title starts with "TO " (e.g., "TO ELEANOR MARION-CRAWFORD")
    if re.match(r"^to\s+[A-Z]", title, re.IGNORECASE) and word_count < 200:
        return "needs_review"

    # Content contains dedication language
    if paragraphs and re.search(r"\bdedicat(e|ed|ion)\b", paragraphs[0], re.IGNORECASE):
        return "needs_review"

    # Last chapter with very few words — likely a closing line
    if index == total - 1 and word_count < MIN_WORDS_SUSPECT:
        return "needs_review"

    return "story"


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def write_output(
    epub_path: str,
    metadata: dict,
    chapters: list[dict],
    output_dir: str,
):
    """Write per-chapter JSON files and a manifest."""
    os.makedirs(output_dir, exist_ok=True)
    total = len(chapters)
    total_words = 0
    manifest_chapters = []

    for i, chapter in enumerate(chapters):
        word_count = sum(len(p.split()) for p in chapter["paragraphs"])
        paragraph_count = len(chapter["paragraphs"])
        total_words += word_count
        chapter_type = classify_chapter(chapter, i, total)

        filename = title_to_filename(chapter["title"], i, total)

        chapter_data = {
            "title": chapter["title"],
            "type": chapter_type,
            "paragraphs": chapter["paragraphs"],
            "wordCount": word_count,
            "paragraphCount": paragraph_count,
        }

        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(chapter_data, f, ensure_ascii=False, indent=2)

        manifest_chapters.append({
            "filename": filename,
            "title": chapter["title"],
            "type": chapter_type,
            "wordCount": word_count,
            "paragraphCount": paragraph_count,
        })

        type_tag = f" [{chapter_type}]" if chapter_type != "story" else ""
        print(f"  {filename} ({word_count} words, {paragraph_count} paragraphs){type_tag}")

    manifest = {
        "source": os.path.abspath(epub_path),
        "title": metadata["title"],
        "creator": metadata["creator"],
        "totalChapters": total,
        "totalWords": total_words,
        "chapters": manifest_chapters,
    }

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\nGenerated manifest.json")
    print(f"Total: {total} chapters, {total_words} words")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <epub_path> [output_dir]")
        sys.exit(1)

    epub_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) >= 3 else os.path.join(os.path.dirname(epub_path), "parsed")

    if not os.path.isfile(epub_path):
        print(f"Error: File not found: {epub_path}")
        sys.exit(1)

    print(f"Parsing: {epub_path}")

    with zipfile.ZipFile(epub_path, "r") as zf:
        opf_path = extract_opf_path(zf)
        metadata = parse_metadata(zf, opf_path)
        spine_hrefs = get_spine_items(zf, opf_path)

        book_id = metadata["book_id"]
        if not book_id:
            book_id = Path(epub_path).stem
            metadata["book_id"] = book_id

        print(f"Book ID: {book_id}")
        print(f"Title: {metadata['title']}")
        print(f"Creator: {metadata['creator']}")
        print(f"Found {len(spine_hrefs)} content files in spine")

        chapters = extract_chapters(zf, spine_hrefs)

    # Strip Gutenberg boilerplate
    chapters = strip_gutenberg(chapters)

    # Filter out chapters with no paragraphs (e.g., section headers)
    chapters = [c for c in chapters if c["paragraphs"]]

    print(f"Detected {len(chapters)} chapters (after filtering)")
    print(f"Writing to: {output_dir}/")

    write_output(epub_path, metadata, chapters, output_dir)
    print("Done.")


if __name__ == "__main__":
    main()
