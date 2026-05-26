# Stories / Reading — UX Reference

Exemplars: **Wattpad, Webtoon, Kindle, Radish.**
Core idea: the **reader** is the product. Everything else exists to get the user into a distraction-free reading flow and bring them back tomorrow. Two reader paradigms coexist: **prose** (paginate or scroll, typography control — Kindle/Wattpad/Radish) and **visual/webtoon** (vertical infinite scroll, one panel at a time — Webtoon). Serialized, episodic release drives daily-habit engagement.

## Key screens

1. **Home / Discover** — featured, trending, genre rails, daily/originals, "for you".
2. **Bookshelf / Library** — what you're reading, saved, downloaded; reading progress.
3. **Story/series detail** — cover, blurb, author, rating, chapter/episode list, start/continue.
4. **The reader** — the core distraction-free reading surface.
5. **Reader settings overlay** — typography, theme, layout.
6. **Chapter / episode list** — ordered list with read/locked/unlock states.
7. **Comments / community** — per-paragraph or per-chapter (Wattpad/Webtoon).
8. **Author/creator profile** — works, followers, follow.
9. **Search & genre browse.**

## Signature components

### The reader (prose)
- **Chrome auto-hides**: tapping the center toggles UI; reading area is otherwise pure text on a clean background. Top bar = back + title + settings; bottom bar = progress + chapter nav.
- **Layout choice: paginate vs scroll** — offer both. Paginate = swipe/tap left-right page turns (book metaphor, clear "page" boundaries, Kindle default). Scroll = continuous vertical swipe-up (Wattpad supports both; web/long-form leans scroll). Let the user pick and remember it.
- **Typography controls** (the settings overlay): **font size (Aa+ / Aa−)**, font family, **line spacing**, paragraph spacing, **margins**, text alignment, optionally bold/character spacing. Kindle exposes line/word/character spacing and margins — generous control = "closest to a real book".
- **Theme**: **Light / Sepia / Dark** (and sometimes black/OLED). Sepia reduces eye strain for long sessions; dark for night. Independent from app theme.
- **Auto-scroll** option with adjustable speed (Wattpad pattern) for hands-free reading.
- **Progress**: a per-chapter and per-book indicator. Let the user choose what it shows — **location, % complete, "time left in chapter", "time left in book"** (Kindle). Indicator should respect the chosen margins.
- **Reference tools** (Kindle X-Ray pattern): tap-and-hold a word/name → dictionary, character/place info, Wikipedia, translate, search-in-book — without leaving the page.
- **Highlights, notes, bookmarks**: select text to highlight/annotate; multiple bookmarks per book; "popular highlights" from other readers as a social signal. Page-Flip-style skim that previews without losing your place.
- **Sync (Whispersync pattern)**: reading position, highlights, notes, and bookmarks sync across all devices; resume exactly where you left off on any device. Switch seamlessly between reading and listening (audio) without losing place.

### The reader (visual / webtoon)
- **Vertical infinite scroll**, **one panel at a time** in the viewport — top to bottom. This is the core innovation: it controls pacing (creators use whitespace for timing/"slow motion" beats) and **prevents accidental spoilers** from spreads visible at once.
- Minimal chrome; tap to toggle a thin top/bottom bar (episode title, like, comment, next/prev episode).
- End-of-episode card: like, comment, share, "Next episode" CTA, rate, and **wait-or-unlock** prompt for premium episodes.
- Pitfall: don't force horizontal page-turn on webtoon content; vertical scroll is non-negotiable for the medium.

### Bookshelf / Library
- Cover-grid (or list) of in-progress, saved, finished, downloaded.
- **Continue Reading** front and center with exact resume point + progress.
- Sort/filter (recently read, title, author, unread); collections/shelves; downloaded-for-offline marker.
- "New chapters available" badges for followed serialized works.

### Story / series detail
- Cover, title, author (linked), genre tags, rating/reads/votes, blurb (expandable).
- **Start Reading / Continue** primary CTA; Add to Library, Follow author, Share.
- **Chapter/episode list**: ordered, each with title, length/word count, publish date, **read/unread + locked/unlocked** state and any coin cost; current position highlighted.
- "Up next release" date for ongoing serials; completion status (Ongoing / Completed / Hiatus).

### Serialized / episodic model
- Content released as **episodes/chapters over time** (not fixed volumes), creating daily/weekly return cycles. Show release cadence and a schedule ("Updates every Friday").
- **Monetization patterns**: free with ads; **coins/tokens to unlock-ahead**; **"Wait to Unlock"** (free after a timer, or pay to skip the wait — Webtoon's Daily Pass / Fast Pass); subscriptions/Premium; tips to authors.
- Notify followers on new chapter drops.

### Discovery
- Genre rails, Trending/Popular (driven by reads + engagement), Editor's picks/Originals, Completed-binge collections, "Because you read X".
- Algorithmic ranking heavily influenced by reader engagement (reads, votes, comments) — so engagement *is* discovery.

### Community
- **Inline comments** (per-paragraph in Wattpad, per-episode in Webtoon), likes/votes, author's notes between chapters, follow author, and amateur-publishing surfaces (Wattpad / Webtoon Canvas).
- Comments create the social loop that keeps serialized readers returning.

### Reading streaks / habit
- Streak counter, daily-reading goals, time-read stats, badges — reinforce the daily habit the serialized model depends on.

## Navigation / IA
- **Mobile bottom tabs**: Home/Discover, Library/Bookshelf, (Create), Notifications, Profile.
- Reader is a **full-screen modal flow** layered above tabs (you exit back to where you were).
- Web: top nav (Discover, Genres, Library, Create) + standard reader.

## What makes them great
- The reader disappears — text/art and tap-to-toggle chrome only.
- Deep, persistent personalization of the *reading environment* (type, theme, layout) that syncs everywhere.
- Webtoon's vertical scroll turned a constraint (small screens) into an expressive, spoiler-safe medium.
- Serialized release + community + streaks manufacture a daily habit.
- Resume-exactly + cross-device sync respects long, multi-session reads.

## Do
- Make the reader distraction-free with tap-to-toggle chrome and full typography control.
- Offer Light/Sepia/Dark and both paginate and scroll, and remember the choice.
- Use vertical infinite scroll for any comic/webtoon content.
- Sync reading position, highlights, and bookmarks across devices.
- Show chapter read/locked states, release cadence, and Continue Reading prominently.
- Support inline comments + follow to build the serialized-return loop.

## Don't
- Don't clutter the reading area with persistent UI.
- Don't lock typography/theme to a single option, or fail to persist the user's settings.
- Don't force horizontal page-turn on webtoon/vertical-scroll content.
- Don't lose the user's place or hide progress.
- Don't make unlock/coin mechanics opaque — show cost and the free-wait option clearly.
