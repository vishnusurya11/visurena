# Visual / brand — round 2 (debate reply)

## 1. CONCEDE

- **Product (Scarlet complete 14/14).** My "Next drop" mark and progress floor line assumed an airing series. Change: the hero's one accent mark is now the **state chip** ("Complete · 14 episodes" / "Continue Ep 7"), and home module two is the slate with vote counts. A *finished* series and an *unmade* one must read differently.
- **Motion (maxresdefault centre crop; artwork-glow option 1).** Poster = centre 720x1280 crop; 2:3 tiles crop from that. I withdraw my glow objection: a 64x36 pre-blurred WebP emitted at ingest is a static image, RN-portable. My objection was runtime `backdrop-filter` and drift, which motion also bans. Glow is **the one place accent is a field**, tint ≤15%.
- **UX (metadata line under every title, hero ≤55vh, no marquee, no hub wordmark).** Accepted. The metadata line is where the mono goes: 12–13px, tabular figures, `text-2`, tracking ≤0.08em, replacing the wide-tracked micro-labels.
- **Mobile (tokens are the brand; base `#0b0c10`; OKLCH clamp on extracted colors; 12px label floor).** Accepted; their L 0.62–0.80 / C ≤0.2 clamp is the guard my ambient-hex idea lacked.

## 2. HOLD

1. **No serif in the chrome (vs mobile).** The title cards already carry a Trajan-style serif; a serif display on top is two headline serifs fighting, and the cards are the brand now. Serif survives only in direction #2 as a distinct editorial voice.
2. **Accent is a mark, once per viewport (vs UX's dot per item + product's accent vote counts + motion's tinted glow, all at once).** Four saturated hues per screen *is* the current site. Budget: the glow tint plus one mark; vote digits are accent only on the slate module.
3. **Warm white `#F2F1EC`, not ivory (vs mobile).** Ivory's yellow cast goes green over the emerald glow and salmon over ruby; neutral-warm white stays white on every wash.

## 3. VOTE

1. **Cinema Lobby** — build first, merged with Signal's data discipline (2px rail, tabular mono numbers) for the slate and episode list: hybrid **"Lobby + Board"**.
2. **Editorial Broadsheet** — keep as the real alternative; its "issue / letters page" metaphor fits a complete series plus an open slate.
3. **Signal** standalone — kill; too cold for period drama, its good parts live in the hybrid.

## 4. THE ONE THING

**Nothing in the chrome glows or is saturated; the poster is the only light source.** No `text-shadow`, no colored `box-shadow`, no accent fills, no uppercase below 12px. Fail this and it is the old site with a new font.

## 5. MOCKUP NOTES

1. **Fonts.** Lobby + Board:
   `<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">`
   Broadsheet:
   `<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&family=Hanken+Grotesk:wght@400..700&display=swap" rel="stylesheet">`
   Display: Geist 500, -0.025em / Newsreader opsz 72, 400. Body 16/1.55. Meta 13px, `font-variant-numeric: tabular-nums`.
2. **Final tokens.** Surfaces `bg-0 #0B0C10`, `bg-1 #141518`, `bg-2 #1C1D21`, `bg-3 #26272B`, hairline `rgba(255,255,255,.08)`. Text `#F2F1EC` / `#A9A8A3` / `#7A7975` (muted lifted so 12px passes 4.5:1 on bg-1). Accents: Stories `#E8B04B`, Movies `#3DD68C`, Music `#F0537A`, Games `#B48CF7`, system `#6C9BFF`. Glow = blurred poster at opacity .6 over bg-0, then accent at 15%.
3. **Hero poster.** Centre-crop of maxresdefault, full 9:16, never cropped in the hero; height = hero (≤55vh) minus 48px; 1px hairline frame, radius 8; bottom scrim to bg-0 over the lower 40%. Row tiles: 2:3 from the top 75% of the 9:16 so the lockup (35–45% height) survives. 16:9 items = double-width tile, same row height.
4. **Accent may touch:** state chip text, progress fill, 2px active-nav underline, slate vote digits, focus rings. **Never:** button fills, section titles, body links, badge backgrounds (badges are text-1 on bg-3), footer swatches (deleted).
5. **Signatures.** Lobby + Board: lit poster with a 2px accent floor line = progress (returning) or state (new). Broadsheet: masthead + folio, "No. 14 · A Study in Scarlet, complete · What next?", hairline rules only. Hybrid slate: 2px accent rail on the active row, tabular Geist Mono vote counts, no marquee.
