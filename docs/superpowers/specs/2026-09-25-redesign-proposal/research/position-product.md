# Position: Product / Programming (streaming & creator-platform lens)

Two corrections to the brief before anything else.
1. `SERIES_GOAL.md` says *A Study in Scarlet* is **complete: 14/14, finished 2026-09-18**, not 11 episodes. There is no "next episode drops" for Scarlet. The live question on this site is **"what does the studio make next"**, which is precisely what the Request board answers.
2. The episodes are **vertical 9:16, ~10 min**, with a 60 s vertical trailer. That puts Visurena in the **vertical micro-drama** category (ReelShort, DramaBox, ShortMax; Netflix "Clips" and Disney+ "Verts" in 2026): mobile-first, 60-120 s cliffhanger episodes, first 5-10 free then coins or weekly VIP, catalogues of romance/revenge/werewolf-CEO. Our position is the opposite corner: **public-domain classics, 10-minute chapters, free, audience-programmed.** "The micro-drama for people who would never download a micro-drama app."

Catalogue today: 1 finished 14-episode vertical series (+ trailer, cast, audiobook, casebook, shorts), 1 story, 3 games, 10 novels queued.

## 1. DIAGNOSIS

- **The site sells the studio's weakest product and hides its strongest.** Fourteen finished episodes, a trailer, a cast and an audiobook exist on YouTube; the Movies page says "Coming soon." A viewer arriving from YouTube cannot find what they just watched.
- **Nothing on the page has a date.** Streaming runs on time: "UP EVERY MONDAY" (Webtoon), "New episodes every other Thursday" (Dropout). No cadence, no reason to return. Retention is a scheduling promise, not a feature.
- **No loop closes.** No follow, notify, continue, progress or vote. Royal Road's entire retention is three buttons (Follow / Favorite / Read Later) feeding one Follow List of updates; we have zero. Every visit is a first visit.
- **The differentiator is invisible.** "Demand-driven" appears nowhere. The page is indistinguishable from a portfolio site.
- **The format is denied.** A vertical series is framed by a landscape "Movies" room. Micro-drama audiences expect phone-first, tap-to-next; Netflix chrome around a 9:16 video looks like an apology for the format.

## 2. NON-NEGOTIABLES

1. **A date-driven, state-aware "Now / Next" strip**, rendered from `Content.chaptersLive/Total/nextChapterAt` (D27) in three real states: *airing* ("Ep 9 of 14 · next Thursday"), *complete* ("14 episodes · binge it"), *in production* ("Frankenstein · casting · first episode ETA"). Never a static "coming soon".
2. **One retention verb everywhere: Follow.** One control, one state, meaning "notify me when this drops" (SES email, D27), and the same control on the Request board meaning "notify me if this gets made". Continue-watching resumes from `Progress`.
3. **A vertical player that is native, not embedded as an afterthought.** Mobile: full-screen 9:16 with tap/swipe to the next episode. Desktop: a pillarboxed 9:16 player with the episode list and chapters in the side gutters. Free, no coin gate; the gate is Follow.

## 3. THE HOMEPAGE AS A PROGRAMMING SURFACE

A thin catalogue is programmed, not browsed. Modules in order:

1. **Hero = the series in its real state.** Portrait title card (the refs/ cards already out-brand the live site), "14 episodes · complete · ~2h 20m", CTAs **Watch Ep 1** / **60 s trailer** (the trailer autoplays muted in the portrait frame on mobile). Signed-in returning viewer: **Continue Ep 7 · 4:12 left**. When the next series is airing, the hero flips to it.
2. **"Next from the studio."** 3-5 portrait cards: the novel in production (state + ETA), the top 2-3 voted requests with counts and an inline Vote, and a "Request a title" card. This is where demand-driven is *shown*.
3. **Continue / New since you followed** (renders only when Progress/Follow exists; never an empty row).
4. **Episode rail**, 14 portrait thumbnails with number, chapter title, runtime, watched ticks. Shorts beneath as a smaller rail.
5. **Read / Play**, honest counts: "Stories · 1", "Games · 3". Music hidden from nav until a track exists; the audiobook lives on the series page.
6. **"How this studio works"** band: one sentence + link.
7. Footer: AI disclosure link, newsletter.

**Copy voice.** Say the AI plainly, once, in the operating description; not in titles, not as "AI-powered". Hiding it is pointless: YouTube auto-labels photorealistic AI in the player since May 2026. Tagline options:
- **"Classic stories. New pictures. You choose what's next."**
- **"A one-person film studio. The audience programs it."**
- **"The classics, ten minutes at a time."**
About line: *"Visurena is one person and a set of AI tools adapting public-domain classics into serialized vertical film. Every frame is generated; every cut is chosen. Vote on the next book."*

## 4. THE SERIES PAGE AND EPISODE PAGE

**Series page, first-time viewer.** Portrait poster and trailer up top; one-paragraph synopsis; a **status line** as the second-loudest element: "Complete · 14 episodes · ~10 min each" or "Airing · Ep 9 of 14 · Next: Thu 2 Oct". CTAs **Start Ep 1**, **Follow**. Episode list **chronological** (a Holmes novel is read in order; Webtoon's reverse order is for open-ended serials), each row: portrait thumbnail, number, chapter title, runtime, date, and a "Thu" chip on scheduled ones. Beneath as tabs: cast with character sheets, audiobook, casebook, shorts. That bundle is the reason to visit the site instead of the channel; Corridor, Beacon and Nebula each justify an owned surface with what a channel page cannot hold (cross-format bundles, schedules, early access).

**Returning fan.** Page opens on **Continue Ep N** with a progress bar; watched episodes ticked; "New" chip on anything published since last visit. Follow persists and doubles as the notify preference. Copy: "Follow to get the next episode by email the moment it's live." Complete series: "Follow the studio · next: Frankenstein".

**The queue of novels.** A "Coming from the library" rail on the series page and Watch index: 10 book covers with state: *in production* (progress: script · cast · rendering), *voted next*, *queued*. Each carries Vote/Follow. ETAs only on the one in production; no fake dates.

**Episode page.** Vertical player (YouTube embed now, S3 MP4 later), chapters/beats alongside, **Up next** with auto-advance and swipe on mobile, prev/next, "Ep 4 of 14" breadcrumb, comments. Under the player, the provenance line: "Generated with AI · directed and edited by hand · [how we make this]", mirroring where YouTube places its own label so the site never looks like it hides what the channel discloses.

**Against micro-drama incumbents.** Their loop is cliffhanger → paywall → coins. Ours: chapter → Follow → vote. Borrow their mechanics (autoplay next, swipe, first-episode-in-feed) and reject their economics; "no coins, ever" is a positioning line worth printing.

## 5. THE REQUEST BOARD

Failure mode: Canny's aesthetic (status columns, grey cards, chevrons). Make it a **slate**, a studio's development board.

- **Home**: the "Next from the studio" strip is the board's top 3 plus the item in production. Vote inline.
- **Nav**: one word, not "Requests" (a support word). **"Next"** or **"Slate"**, with a live count ("Next · 312 votes this week"). This is our Community tab, with consequences.
- **Series page**: on any work with `producedWorkId`, "Requested by 41 people · made in 6 weeks"; at the bottom, "What should we adapt after this?" with three vote cards.
- **Board page**: book-cover cards, one-line pitch, format chip (episodes / feature / shorts), vote count, Vote; filter by room; three lanes **Voting · In production · Released**. Released links to the work: the conversion trail is the proof the model is real. Per Canny's own guidance: promise the notify, keep statuses moving, and add a "Studio's choice" each cycle so it never becomes a pure popularity contest.
- **Anonymous** browse with counts; voting requires sign-in (one vote per user, D32), presented as a consequence of the vote, not a wall.

## 6. WHERE I EXPECT TO DISAGREE

- **UX/IA**: they will keep five verticals for symmetry. I want inventory-driven nav: Watch · Read · Play · Next · About, Music hidden until there is music. Empty destinations cost more than asymmetry.
- **Visual/brand**: they will lead with nebula and the giant serif "Movies". I want a portrait poster and a status line; the series art carries the brand. Atmosphere instead of dates is the current problem.
- **Motion/frontend**: scroll-fade-in sections produced the black voids in the screenshots. Program modules render immediately; save motion for state changes (vote count ticking, a "New" chip arriving). They may also resist a pillarboxed desktop player; I will accept letterbox gutters filled with the episode list before I accept cropping 9:16 to 16:9.
- **Mobile/design-systems**: they will want one 3:4 card ratio everywhere. Episodes and title cards are 9:16, book covers 2:3, games 16:9. Three ratios, tokenised, is correct.
- **Everyone**: they may treat the Request board as a secondary page. It is the second module on the homepage, above the story and the games.

## 7. REFERENCES

- https://www.dropout.tv/ — cadence text on show cards ("New episodes every other Thursday"); visitor vs subscriber messaging.
- https://www.webtoons.com/en/fantasy/tower-of-god/list?title_no=95 — "UP EVERY MONDAY" status line, Subscribe, "Continue reading" vs "First episode" CTAs.
- https://www.webtoons.com/en/ — day-of-week schedule tabs, NEW/UP badges.
- https://www.royalroad.com/home (403 on fetch; Follow / Favorite / Read Later and the Follow List confirmed via search of its knowledge base).
- https://critrole.com/show-schedule/ and https://beacon.tv/categories/programming-schedule — weekly schedule as a first-class page; per-show platform links (Beacon, YouTube, Twitch).
- https://en.wikipedia.org/wiki/Nebula_(streaming_service) — early access, no ads, originals: the owned site adds what YouTube cannot.
- https://blog.youtube/news-and-events/disclosing-ai-generated-content/ — "altered or synthetic" disclosure, placement, stated purpose: trust.
- https://thothium.com/blog/youtube-auto-labels-ai-videos-2026 — May 2026 automatic labels for photorealistic AI, in-player; not buried or demonetised.
- https://canny.io/blog/position-feature-voting-customers/ — name the board specifically, promise notify + transparency, close the loop.
- https://support.google.com/youtube/answer/3219384?hl=en — what a channel Home tab already offers (trailer, featured sections, Community), i.e. what not to duplicate.
- https://filmustage.com/blog/short-drama-apps-compared-reelshort-vs-dramabox-in-2026/ — micro-drama gating: episodes 1-5/10 free, then coins, weekly VIP or reward ads.
- https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/short-form-video-series.html — 60-90 s episodes, freemium, romance/revenge tropes, "series-aware" feeds and continue-watching rails recommended, independents using AI and engagement data.
