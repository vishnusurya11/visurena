// pages/games.tsx — Games section landing (Amethyst room)
//
// Same rhythm as the other section landings:
//   Masthead → featured showcase (1 main) → Trending (ranked) → catalogue grid → newsletter.
// Games are playable now, so this mirrors the Stories landing (real, available content)
// rather than the Movies/Music "coming soon" slate. Cards are 16:9 (game thumbnails are 800×450).

import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { VRFade, VRPoster, VRRowHeader, Header, Footer } from "@visurena/ui";
import { VRNewsletter } from "../components/VRNewsletter";
import contentConfig from "../content-config.json";

// ─── Design constants ─────────────────────────────────────────────────────────
const F_DISPLAY = "'Newsreader', 'Tiempos Headline', serif";
const F_BODY    = "'Spectral', serif";
const F_MONO    = "'JetBrains Mono', ui-monospace, monospace";
const F_WEIGHT  = 600;
const IVORY     = "#f5efdb";
const AMETHYST  = "#c084fc"; // Games stone

// ─── Types ────────────────────────────────────────────────────────────────────
interface Game {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  playUrl?: string;
  duration?: string;
  releaseDate?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  players?: string;
  controls?: string;
  difficulty?: string;
}

const GAMES: Game[] = (contentConfig.games as Game[]) ?? [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cap(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function genreOf(g: Game): string | undefined {
  return g.tags && g.tags[0] ? cap(g.tags[0]) : undefined;
}

function metaLine(g: Game): string {
  return [genreOf(g), g.players, g.difficulty].filter(Boolean).join(" · ");
}

function href(g: Game): string {
  return g.playUrl || `/games/${g.slug}`;
}

// ─── Masthead ─────────────────────────────────────────────────────────────────
function Masthead({ stats }: { stats: { n: string; label: string }[] }) {
  return (
    <section style={{ padding: "84px clamp(28px, 4vw, 80px) 56px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 30%, ${AMETHYST}12 0%, transparent 55%)`, pointerEvents: "none" }} />
      <VRFade style={{ position: "relative", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 64, alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMETHYST, textTransform: "uppercase" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: AMETHYST, boxShadow: `0 0 16px ${AMETHYST}80` }} />
            The Amethyst room
          </div>
          <h1 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(80px, 9vw, 144px)", lineHeight: 0.9, margin: 0, color: IVORY, letterSpacing: "-0.03em" }}>Games</h1>
          <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, color: "#cdc6b6", maxWidth: 600, marginTop: 22, marginBottom: 0 }}>
            Arcade classics, reimagined. Play instantly in your browser — no installs, no accounts, no ads.
          </p>
        </div>
        <div style={{ display: "flex", gap: 48, justifyContent: "flex-end", fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.2em", color: "#7a7363", textTransform: "uppercase", paddingBottom: 12 }}>
          {stats.map(({ n, label }) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: F_DISPLAY, fontSize: 44, lineHeight: 1, color: IVORY, letterSpacing: "-0.02em", marginBottom: 6, fontWeight: F_WEIGHT }}>{n}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </VRFade>
    </section>
  );
}

// ─── Featured (1 main showcase) ────────────────────────────────────────────────
function Featured({ game }: { game: Game }) {
  const words = game.title.split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words[words.length - 1];

  return (
    <section style={{ position: "relative", padding: "84px clamp(28px, 4vw, 80px)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 60%, ${AMETHYST}25 0%, transparent 55%)`, pointerEvents: "none" }} />
      <VRFade style={{ position: "relative", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 64, alignItems: "center" }}>
        <Link href={href(game)} className="vr-card vr-link" style={{ textDecoration: "none", display: "block" }}>
          <VRPoster seed={3} accent={AMETHYST} tint={AMETHYST} image={game.thumbnail} style={{ width: "100%", aspectRatio: "16/9" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.72) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, padding: 36, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.22em", color: AMETHYST, textTransform: "uppercase" }}>&#9733; Featured game</div>
              <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(40px, 4.6vw, 68px)", lineHeight: 0.95, color: IVORY, letterSpacing: "-0.02em", fontWeight: F_WEIGHT }}>{game.title}</div>
            </div>
          </VRPoster>
        </Link>

        <div>
          <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMETHYST, textTransform: "uppercase", marginBottom: 14 }}>&#9679; {metaLine(game)}</div>
          <h2 style={{ fontFamily: F_DISPLAY, fontWeight: F_WEIGHT, fontSize: "clamp(56px, 6.4vw, 96px)", lineHeight: 0.92, color: IVORY, letterSpacing: "-0.025em", margin: 0 }}>
            {lead}{lead ? <br /> : null}<em style={{ fontStyle: "italic", color: AMETHYST }}>{last}</em>
          </h2>
          {game.description && (
            <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: "#cdc6b6", maxWidth: 560, marginTop: 24 }}>{game.description}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 36 }}>
            <Link href={href(game)} className="vr-cta vr-cta-solid vr-link" style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", background: IVORY, color: "#0a0a0a", fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.45) inset" }}>
              <span style={{ width: 0, height: 0, borderLeft: "9px solid #0a0a0a", borderTop: "6px solid transparent", borderBottom: "6px solid transparent" }} />
              Play now
            </Link>
            {game.rating != null && (
              <span style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: "0.18em", color: "#cdc6b6", textTransform: "uppercase" }}>
                &#9733; {game.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </VRFade>
    </section>
  );
}

// ─── Trending (ranked by rating) ───────────────────────────────────────────────
function Trending({ games }: { games: Game[] }) {
  const ranked = [...games].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 8);
  return (
    <section style={{ padding: "56px clamp(28px, 4vw, 80px) 72px", background: "rgba(8,8,8,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <VRRowHeader eyebrow="Arcade charts" title="Trending this week" meta="Ranked by player rating" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28, marginTop: 44 }}>
        {ranked.map((g, i) => (
          <VRFade key={g.slug} delay={i * 70}>
            <Link href={href(g)} className="vr-card vr-link" style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "end", gap: 0, minWidth: 0, textDecoration: "none" }}>
              <div style={({ fontFamily: F_DISPLAY, fontSize: "clamp(96px, 8vw, 150px)", lineHeight: 0.78, color: "transparent", WebkitTextStroke: `1.2px ${AMETHYST}`, fontWeight: F_WEIGHT, marginRight: -8, marginBottom: -4, alignSelf: "end" }) as React.CSSProperties}>{i + 1}</div>
              <VRPoster seed={i + 50} accent={AMETHYST} tint={AMETHYST} image={g.thumbnail} style={{ width: "100%", aspectRatio: "16/9", minWidth: 0 }}>
                <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  {genreOf(g) && <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: AMETHYST, textTransform: "uppercase" }}>{genreOf(g)}</span>}
                  <div>
                    <div style={{ fontFamily: F_DISPLAY, fontSize: "clamp(16px, 1.4vw, 22px)", lineHeight: 1.05, color: IVORY, letterSpacing: "-0.01em" }}>{g.title}</div>
                    {g.rating != null && <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)", marginTop: 6, textTransform: "uppercase" }}>&#9733; {g.rating.toFixed(1)}</div>}
                  </div>
                </div>
              </VRPoster>
            </Link>
          </VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Catalogue card ─────────────────────────────────────────────────────────────
function GameCard({ game, seed }: { game: Game; seed: number }) {
  return (
    <article className="vr-card" style={{ position: "relative" }}>
      <Link href={href(game)} className="vr-link" style={{ textDecoration: "none", display: "block" }}>
        <VRPoster seed={seed} accent={AMETHYST} tint={AMETHYST} image={game.thumbnail} style={{ width: "100%", aspectRatio: "16/9", marginBottom: 14 }}>
          <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {genreOf(game) && <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.2em", color: AMETHYST, textTransform: "uppercase" }}>{genreOf(game)}</span>}
              {game.rating != null && <span style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.55)" }}>&#9733; {game.rating.toFixed(1)}</span>}
            </div>
            <div style={{ fontFamily: F_DISPLAY, fontSize: 24, lineHeight: 1.0, color: IVORY, letterSpacing: "-0.01em" }}>{game.title}</div>
          </div>
          {game.description && (
            <div className="vr-card-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 60%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
              <div style={{ fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#cdc6b6", textTransform: "uppercase", marginBottom: 6 }}>{metaLine(game)}</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 12, lineHeight: 1.35, color: "#cdc6b6", margin: 0 }}>{game.description}</p>
            </div>
          )}
        </VRPoster>
      </Link>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_MONO, fontSize: 9, letterSpacing: "0.18em", color: "#7a7363", textTransform: "uppercase" }}>
        <span>{metaLine(game)}</span>
        <span>{game.duration}</span>
      </div>
    </article>
  );
}

// ─── Catalogue (with tag filter) ────────────────────────────────────────────────
function Catalogue({ games }: { games: Game[] }) {
  const [filter, setFilter] = useState("all");
  const allTags = ["all", ...Array.from(new Set(games.flatMap((g) => g.tags ?? [])))];
  const shown = filter === "all" ? games : games.filter((g) => g.tags?.includes(filter));

  return (
    <section style={{ padding: "56px clamp(28px, 4vw, 80px) 64px" }}>
      <VRRowHeader eyebrow="All · Games" title="The catalogue" meta={`${games.length} ${games.length === 1 ? "game" : "games"}`} />

      {allTags.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
          {allTags.map((tag) => {
            const active = filter === tag;
            return (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className="vr-cta"
                style={{
                  fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  padding: "8px 16px", cursor: "pointer", background: "transparent",
                  border: `1px solid ${active ? AMETHYST : "rgba(255,255,255,0.18)"}`,
                  color: active ? AMETHYST : "#cdc6b6",
                }}
              >
                {cap(tag)}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, marginTop: 32 }}>
        {shown.map((g, i) => (
          <VRFade key={g.slug} delay={i * 50}><GameCard game={g} seed={i + 10} /></VRFade>
        ))}
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function GamesPage({ games }: { games: Game[] }) {
  const featured = games.find((g) => g.featured) ?? [...games].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  const genres = Array.from(new Set(games.flatMap((g) => g.tags ?? [])));
  const stats = [
    { n: String(games.length), label: games.length === 1 ? "Game" : "Games" },
    { n: String(genres.length), label: "Tags" },
    { n: "Free", label: "To play" },
  ];

  return (
    <>
      <Head>
        <title>{"Games — Visurena"}</title>
        <meta name="description" content="Arcade classics reimagined — play instantly in your browser. No installs, no accounts, no ads." />
      </Head>
      <div className="vr-app" style={{ background: "transparent", color: IVORY, fontFamily: F_BODY, fontSize: 16, lineHeight: 1.55 }}>
        <Header />
        <main className="vr-page">
          <Masthead stats={stats} />

          {featured ? (
            <>
              <Featured game={featured} />
              <Trending games={games} />
              <Catalogue games={games} />
            </>
          ) : (
            <section style={{ padding: "120px clamp(28px, 4vw, 80px)", textAlign: "center" }}>
              <div style={{ fontFamily: F_MONO, fontSize: 10, letterSpacing: "0.24em", color: AMETHYST, textTransform: "uppercase", marginBottom: 18 }}>&#9679; Coming soon</div>
              <p style={{ fontFamily: F_BODY, fontStyle: "italic", fontSize: 24, color: "#cdc6b6", maxWidth: 540, margin: "0 auto" }}>The arcade is loading. Check back shortly.</p>
            </section>
          )}

          <VRNewsletter
            eyebrow="The Arcade Post"
            headline={<>New games in your inbox,<br /><em style={{ fontStyle: "italic", color: AMETHYST }}>the day they drop.</em></>}
            subtext="New browser games every month — arcade classics, reimagined. No tracking, no ads. Free during open beta."
            background="#050505"
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { section: "games", games: GAMES } };
};
