# 🎯 Complete Content Management Guide

## 📁 File Structure Overview

```
visurena-next/
├── posts/                     ← BLOG POSTS (HTML files)
├── public/images/             ← IMAGES for blog posts
├── content-config.json        ← VIDEOS & MUSIC configuration
```

---

## 🎬 Adding Movies/Videos

**File**: `visurena-next/content-config.json`

### Step 1: Get YouTube Video ID
From `https://www.youtube.com/watch?v=YfsdEYdr7Fs` → ID is `YfsdEYdr7Fs`

### Step 2: Add to JSON
```json
{
  "movies": [
    {
      "id": "mov-3",
      "type": "movie",
      "title": "Your Video Title",
      "description": "Brief description of your video",
      "thumbnail": "https://img.youtube.com/vi/YfsdEYdr7Fs/maxresdefault.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=YfsdEYdr7Fs",
      "duration": "10 min",
      "releaseDate": "2025-01-15",
      "tags": ["creative", "tutorial"],
      "rating": 4.8
    }
  ]
}
```

### Step 3: Save & Refresh
- Save the file
- The video appears automatically (no restart needed)

---

## 🎵 Adding Music/Audio

**File**: `visurena-next/content-config.json`

### Step 1: Get YouTube Video ID
From your music video URL → Extract the ID

### Step 2: Add to Music Array
```json
{
  "music": [
    {
      "id": "mus-3",
      "type": "music",
      "title": "My New Song",
      "description": "Original music composition",
      "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
      "duration": "3:45",
      "releaseDate": "2025-01-15",
      "tags": ["original", "composition"],
      "rating": 4.9
    }
  ]
}
```

---

## 🎮 Adding Games (Coming Soon)

**File**: `visurena-next/content-config.json`

### When Ready to Add Games:
```json
{
  "games": [
    {
      "id": "game-1",
      "type": "game",
      "title": "My New Game",
      "description": "Awesome game description",
      "thumbnail": "/images/game-thumbnail.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=TRAILER_ID",
      "playUrl": "https://your-game-link.com",
      "duration": "2-3 hours",
      "releaseDate": "2025-03-01",
      "tags": ["puzzle", "indie"],
      "rating": 4.5
    }
  ]
}
```

---

## 📖 Adding Stories (Coming Soon)

**File**: `visurena-next/content-config.json`

### When Ready to Add Stories:
```json
{
  "stories": [
    {
      "id": "story-1",
      "type": "story",
      "title": "My Story Title",
      "description": "Story synopsis",
      "thumbnail": "/images/story-cover.jpg",
      "readUrl": "/stories/story-slug",
      "duration": "30 min read",
      "releaseDate": "2025-02-15",
      "tags": ["fiction", "adventure"],
      "rating": 4.8
    }
  ]
}
```

---

## 📝 Adding Blog Posts

**Location**: `visurena-next/posts/`

### Step 1: Create HTML File
**File**: `posts/my-new-post.html`

### Step 2: Use This Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta name="title" content="Your Post Title">
    <meta name="description" content="Brief description for previews">
    <meta name="date" content="2025-01-15">
    <meta name="image" content="/images/your-featured-image.jpg">
    <meta name="tags" content="tutorial, AI, development">
    <title>Your Post Title</title>
</head>
<body>
    <div style="color: #ffffff; font-family: system-ui, sans-serif; line-height: 1.6;">
        
        <p>Your introduction paragraph...</p>

        <h2 style="color: #3b82f6; margin-top: 2rem;">Main Section</h2>
        
        <p>Content with <strong>bold</strong> and <em>italic</em> text.</p>

        <img src="/images/your-image.jpg" alt="Description" 
             style="width: 100%; max-width: 600px; margin: 2rem auto; display: block; border-radius: 8px;">

        <h3 style="color: #fbbf24; margin-top: 1.5rem;">Subsection</h3>
        
        <ul style="color: #b3b3b3;">
            <li>Point 1</li>
            <li>Point 2</li>
            <li>Point 3</li>
        </ul>

        <p>More content...</p>

    </div>
</body>
</html>
```

### Step 3: Add Images
1. Put images in: `public/images/your-image.jpg`
2. Reference as: `src="/images/your-image.jpg"`

### Step 4: Save & Restart
- Save the HTML file
- Restart: `npm run dev`
- Post appears in `/blog`

---

## 🖼️ Image Management

### Location
**All images**: `visurena-next/public/images/`

### Supported Formats
- `.jpg`, `.png`, `.gif`, `.webp`
- Keep under 1MB each for performance

### Usage Examples
```html
<!-- In blog posts -->
<img src="/images/my-image.jpg" alt="Description">

<!-- In JSON config (for thumbnails) -->
"thumbnail": "/images/my-thumbnail.jpg"

<!-- YouTube thumbnails (automatic) -->
"thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
```

---

## 🚀 Quick Adding Workflows

### Add Video (2 minutes):
1. Upload to YouTube
2. Copy video ID from URL
3. Edit `content-config.json`
4. Add to `movies` or `music` array
5. Save → Done!

### Add Blog Post (5 minutes):
1. Create `posts/my-post.html`
2. Copy template from above
3. Add your content
4. Add images to `public/images/`
5. Save → Restart dev → Done!

### Add Images:
1. Drop in `public/images/`
2. Reference as `/images/filename.jpg`
3. Done!

---

## 📱 Testing Checklist

Before publishing:
- [ ] Content displays correctly
- [ ] Images load properly
- [ ] Mobile responsive (resize browser)
- [ ] Links work
- [ ] Videos play
- [ ] No console errors (F12)

---

## 🎯 Pro Tips

1. **Video IDs**: Always from the YouTube URL part after `v=`
2. **Images**: Use descriptive filenames
3. **Dates**: Use format `2025-01-15` (YYYY-MM-DD)
4. **Tags**: Use consistent, lowercase tags
5. **Thumbnails**: YouTube auto-generates, or use your own
6. **File naming**: Use lowercase with hyphens (no spaces)

---

## 🔄 Content Updates

### Update Video Info:
- Edit `content-config.json`
- Save (auto-updates, no restart needed)

### Update Blog Post:
- Edit HTML file in `posts/`
- Restart dev server
- Changes appear

### Add New Images:
- Drop in `public/images/`
- Reference immediately

---

**This guide covers everything you need to manage all content types! 🎉**
---

## 🎞️ Ingest from visurena_studio (Movies)

The Movies room is not hand-edited. `content-local/series.json` and the files under
`apps/web/public/movies/<slug>/` are **generated** from the studio ledgers by

```
pnpm -C apps/web content:ingest-studio
# = node scripts/ingest-studio.mjs [--library <dir>] [--out <series.json>] [--public <dir>]
#                                  [--ffmpeg <exe>] [--ffprobe <exe>] [--force] [--dry-run]
```

Defaults: library `../visurena_studio/library` (env `VR_STUDIO_LIBRARY`), out
`content-local/series.json`, public `apps/web/public/movies`, ffmpeg from `--ffmpeg`, `FFMPEG`,
`C:\Users\vishn\bin\ffmpeg.exe` or PATH. Without an ffprobe the script parses the `ffmpeg -i`
banner for durations and frame sizes. No npm dependencies.

### What it reads (per `library/<stamp>_<book-slug>/`)

| Input | Used for |
|---|---|
| `SERIES_PROGRESS.json` → `episodes[{chapter,title,state,video_id}]` | **when present (Scarlet only):** episode list (published only), titles, YouTube ids, **status**: all published → `complete`, some → `airing`, none → `in-production` |
| `uploads.jsonl` alone (every book after Scarlet) | the same list, derived: **file order is the truth** (clocks mix naive and UTC); a deleted id never counts (`{"event":"deleted"}` or `"deleted": "True"`); a video's privacy is its last value; per episode the **newest public upload wins** and the others are reported as duplicates to unlist; the planned total comes from `Ep NN/TT` in the titles |
| `uploads.jsonl` rows with `episode: "compilation"` | `compilation` — the whole book as one regular video (last public, undeleted) |
| `{"event":"playlist"}` row, else a `list=` link in `compilation/youtube.json` or `episodes/ep01/youtube.json` | `playlistId` — "Watch in order on YouTube"; a book whose playlist is not linked locally (Jekyll) keeps an editorial `playlistId` in series.json |
| `uploads.jsonl` → `{episode, video_id, title, sha8, key, at}` | `publishAt` = `at` of the **first upload row** per episode (a `#retitle` row is an event, not a publish); `sha8` identifies the published cut |
| `episodes/epNN/cut/master*.mp4` | the file whose sha256 starts with the ledger `sha8` (fallback `master.mp4`, then newest `master_*.mp4`) → runtime (`m:ss`), `aspect` (`9:16` / `1:1` / `16:9` from the frame size) + still at 40 % of duration → `epNN.jpg` at the **source aspect**, longest side 960 (square → 960×960) |
| `title/ep01.png` | `poster.jpg` 720×1280 (a portrait card is centre-cropped; a square or landscape card is **fitted whole over a blurred copy** so its lettering survives), then `glow.jpg` 64×114 |
| `trailer/main/TRAILER60-*.mp4` | `trailer.jpg` (frame at 2 s) and `trailer-60.mp4` (copied only if ≤ 25 MB) |
| `cast/<id>/portrait.png` | `cast/<id>.jpg` 480×640 (centre-cropped to 3:4) for the cast ids listed in series.json |
| `source/book.json` | title / author for a book that is not in series.json yet |

Slugs: the stamp is stripped and a subtitle after `-or-` is dropped
(`frankenstein-or-the-modern-prometheus` → `frankenstein`). Episode stills are never cropped
(CSS `object-fit` crops per card); the series `aspect` is the majority of its episodes' measured
aspects. Poster, trailer poster and cast portraits have fixed frames, so a source that does not
match (landscape portraits) is centre-cropped before scaling. Media work is skipped
when the output exists and is newer than its input; `--force` redoes everything; `--dry-run`
prints the plan.

### Ledger vs editorial

The ledger owns: `status`, `aspect`, `episodes[]`, ids, dates, runtimes and every asset path (a path is
written only when the file exists; `poster` is always written so the UI can fall back to the
typeset card). The **existing series.json owns the editorial fields** and they are read back
on every run: `subtitle`, `author`, `year`, `synopsis`, `accent`, `extras`, `production`, and
the cast list (which ids, display names, roles). Edit those in `content-local/series.json`
and re-run; they survive (so do `title` and `playlistId`). A book folder with **neither**
`SERIES_PROGRESS.json` **nor a public upload** is included only if series.json already lists it
(as `in-production`, e.g. Frankenstein); every other book in the library is skipped until it
publishes. When a probe fails (a busy disk), the episode keeps the runtime and aspect last
measured for the **same** YouTube id. Master hashes are cached in
`apps/web/node_modules/.cache/ingest-studio/sha256.json` by path, size and mtime, so a re-run
does not re-read gigabytes of masters off the studio's spinning disk.

Files the coordinator drops in by hand (`frankenstein/poster.jpg`, `frankenstein/glow.jpg`,
`a-study-in-scarlet/backdrop.jpg`) are never written by the script; it only links them when
they exist.

---

## 🔬 Publishing a research article (D36/D37)

Research articles are one self-contained, dated folder each, and **they live in git** at
`content-local/research/` (owner, 2026-11-10), so they travel with the branch. Set
`VR_RESEARCH_DIR` to read them from somewhere else. Stories and other works stay in S3.

```
content-local/research/YYYY/MM/DD/<slug>/
├─ item.json      the manifest — the only required file (slug, title, claim, type, status, publishAt, version …)
├─ article.md     kind "note": Markdown body (GFM tables); front-matter optional, item.json wins
├─ report.html    kind "report": a self-contained HTML report, embedded in a sandboxed iframe
├─ summary.png    optional one-screen card (OG image)
├─ paper.pdf      optional print copy beside the page (Google Scholar picks it up)
└─ data/          metrics, ledgers, HASHES.txt — every file is linked under "Data"
```

1. Copy the template from `docs/superpowers/specs/2026-10-22-research-and-shorts-publishing/template/`.
2. Fill `item.json`: the **claim** names n, units and the date; `headline` is the one number;
   `measuredOn` and `limitations` are what make it credible; `status: "draft"` hides it,
   `"live"`/`"scheduled"` show it from `publishAt`.
3. Work through `template/CHECKLIST.md` (honesty, reproducibility, scrub private paths, the
   MiniMax-H3 media hold).
4. `pnpm -C apps/web build` → `/research/` and `/research/<slug>/` are generated with canonical
   URL, Open Graph, Google Scholar `citation_*` tags, `ScholarlyArticle` JSON-LD, a BibTeX block
   and `/research/feed.xml`. The canonical base is `NEXT_PUBLIC_SITE_URL` (default
   `https://visurena.com`; set it per env).
5. After a Zenodo release mints a DOI, write it into `item.json.doi`, bump `version`, add a
   `changelog` row and rebuild — the cite block and `citation_doi` follow.
