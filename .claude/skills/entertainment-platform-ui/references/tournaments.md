# Tournaments / Esports / Competitive — UX Reference

Exemplars: **FACEIT, Challonge, Battlefy, Toornament, Liquipedia.**
Core idea: make competition **legible and live**. The bracket is the spine; everything updates in real time so players know where/when to play and spectators can follow from first match to final without refreshing. Distinct audiences — **organizers** (create/manage), **competitors** (register/check-in/report), **spectators** (follow live) — each need different views of the same data.

## Key screens

1. **Tournament hub / landing** — banner, game, format, prize, dates, status, **Register/Join** CTA, schedule, rules.
2. **Bracket view** — the visualization of the whole competition.
3. **Match page** — one matchup: teams, score, maps/games, live state, report/dispute.
4. **Leaderboard / standings** — ranking by points/wins (round robin, Swiss, league, ladder).
5. **Registration flow** — sign up solo or as a team.
6. **Check-in screen** — confirm presence in the time window before start.
7. **Team / player profile** — roster, stats, history, logo.
8. **Schedule / calendar** — upcoming matches with times.
9. **Organizer dashboard** — create tournament, seed, manage matches, resolve disputes.

## Signature components

### Bracket visualization (the centerpiece)
- Support the formats and render each clearly:
  - **Single elimination** — one tree, winners advance, losers out.
  - **Double elimination** — **Upper (winners) + Lower (losers) bracket + Grand Final**; this is the esports default (a second chance produces a more legitimate champion). The hardest to render — keep upper and lower **viewable together / clearly related**.
  - **Round robin** — everyone plays everyone → render as a **standings table** + a results matrix/grid, not a tree.
  - **Swiss** — round-by-round pairings by record + a standings table.
  - **Group stage → playoffs** — groups (tables) feeding a knockout bracket.
- Match node ("match card"): two seeds with **team logo + name + seed**, score per team, winner highlighted (advances/connects to next node), match time/status, click → match page.
- **Real-time updates**: nodes update as matches finish — no refresh; spectators watch advancement live. **OBS/stream overlay** export so the bracket can sit on a broadcast.
- Navigation at scale: zoom/pan, collapse rounds, jump to a team, highlight a team's path; round headers (Ro16, QF, SF, Final). Team logos make events look professional.
- **Pitfall (real Liquipedia complaint):** brackets that **shrink/move so you can't see upper and lower bracket together**, and playoff brackets that are hard to find. Keep brackets findable, stable, and legibly co-visible; never auto-resize them into uselessness.

### Match page
- Header: **Team A vs Team B**, big **score**, format (Bo1/Bo3/Bo5), round, and a **LIVE** indicator when active.
- Per-game/per-map breakdown: map name, individual scores, picks/bans, duration.
- **Live real-time score** with auto-update; streams/VOD embeds; jump-to-live.
- Competitor actions: **report result / submit score**, upload proof (screenshot), confirm or **dispute** opponent's report, ready-up.
- Player stat lines, head-to-head history, comments/chat.
- Pitfall: don't make result-reporting/dispute hard to find — it's the competitor's primary action.

### Leaderboard / standings
- Sortable table: rank, team/player (logo + name), **W-L (and ties)**, points, game-specific tiebreakers (map diff, round diff), recent-form streak.
- Highlight current user/team; promotion/relegation or qualification cutlines; pagination/search for large fields.
- Ladder/ELO variants: rating, rank tier badge, peak, movement arrow.

### Registration flow
- From the hub: **Register / Join**. Solo or **team registration** (create team, invite roster by tag/email, assign captain, set roles).
- Collect required fields (game IDs, region, agree to rules), eligibility checks, capacity/waitlist, paid-entry checkout if applicable.
- Confirmation + add-to-calendar + what-happens-next (check-in time).
- Pitfall: don't lose people between "registered" and "actually in the bracket" — make the next step (check-in) explicit.

### Check-in
- A **time-boxed window before start** where registered participants confirm attendance (single tap "Check in").
- Countdown timer, clear status (Not checked in / Checked in / Window closed), reminders/notifications; no-shows auto-dropped or replaced by waitlist.
- This step prevents dead matches against no-shows — make it impossible to miss (push, banner, email).

### Team / player profile
- Logo/avatar, name/tag, region, roster with roles, **stats** (win rate, recent matches, tournament history/placements), achievements/badges, social links, Follow.
- Pitfall (Liquipedia): make stats and rankings **easy to reach** — don't bury them.

### Schedule / calendar
- Upcoming matches with **localized times**, round, teams, stream link; filter by day/round/stage; add-to-calendar; live-now section pinned.

### Organizer dashboard
- Create tournament (game, format, size, rules, schedule, prize), **auto-seed/auto-generate bracket**, manage check-in, advance/override results, resolve disputes, message participants, publish/embed (public/private links, embeddable widgets).

## Real-time / live considerations
- WebSocket/live updates for scores, bracket advancement, check-in status, and match state — the whole appeal is *live*. Show a clear LIVE badge and last-updated state.
- Spoiler control (Liquipedia pattern): offer a **spoiler-free mode** that hides results until the user opts in.

## Navigation / IA
- Tournament hub as the anchor; tabbed sub-nav: **Overview | Bracket | Standings | Schedule | Teams | Rules**.
- Global: Browse tournaments (by game/region/status: upcoming/live/completed), My Tournaments, Create.
- Mobile: bottom tabs (Discover, My Matches, Brackets/Live, Profile); brackets need horizontal scroll/zoom on small screens — design the mobile bracket deliberately, it's the hardest responsive problem here.

## What makes them great
- One legible, live bracket that organizers, players, and spectators all read from.
- Real-time everything (scores, advancement, check-in) with no refresh.
- Self-serve result reporting + dispute keeps brackets moving without an admin bottleneck.
- Check-in eliminates no-show dead matches.
- Team logos + clean brackets make even small events feel pro; spoiler-free mode respects spectators.

## Do
- Render single/double elim, round robin, and Swiss each in their natural form (tree vs table vs matrix).
- Keep upper+lower brackets co-visible and brackets findable, stable, zoomable.
- Update scores/advancement/check-in in real time with a LIVE badge.
- Make register → check-in → report-result an obvious, guided path.
- Show team logos, easy-to-reach stats, localized schedules, and a spoiler-free option.

## Don't
- Don't auto-shrink/relocate brackets so upper and lower can't be seen together.
- Don't bury check-in, result reporting, disputes, or rankings.
- Don't force a bracket tree onto round-robin/Swiss (use standings tables).
- Don't require manual refresh for live data.
- Don't neglect the mobile bracket — it's the make-or-break responsive view.
