import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import contentData from '../content-config.json';
import { getAllPosts } from '../lib/blog';

// ---------- Types ----------
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  releaseDate?: string;
}

interface HomeProps {
  blogPosts: BlogPost[];
}

// ---------- Static config ----------
const SEARCH_PLACEHOLDERS = [
  "A film you can't stop thinking about…",
  'A novel ending that wrecked you…',
  'A song that hit just right…',
  'A game you wish someone would make…',
];

const TRENDING_PILLS = [
  'slow-burn sci-fi mystery',
  'mid-budget heist',
  'electronic dream-pop',
  'first-person walking sims',
  'sapphic regency',
  'vinyl-warm jazz',
];

// ---------- Helpers ----------
const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
};

// ---------- Page ----------
export default function Home({ blogPosts }: HomeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [why, setWhy] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  // Rotating placeholder — pause if user is mid-typing.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (searchFocused && searchQuery.length > 0) return;
      setPlaceholderVisible(false);
      window.setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 420);
    }, 3000);
    return () => window.clearInterval(id);
  }, [searchFocused, searchQuery.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const params = new URLSearchParams({ q });
    if (why.trim()) params.set('why', why.trim());
    router.push(`/search?${params.toString()}`);
  };

  const fillFromPill = (label: string) => {
    setSearchQuery(label);
  };

  // ---------- Catalog row data: 2 music + 6 games ----------
  const musicCards = (contentData.music || []).slice(0, 2);
  const gameCards = (contentData.games || []).slice(0, 6);

  return (
    <Layout pageTheme="home">
      {/* ============================================================ */}
      {/* HERO — search as hero (~95vh)                                */}
      {/* ============================================================ */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-5 sm:px-8 pt-16 pb-20 overflow-hidden -mt-20">
        {/* Aurora atmospheric blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[720px] max-w-[140vw] z-0 blur-[8px]"
          style={{
            background:
              'radial-gradient(ellipse at 35% 50%, rgba(107,125,255,0.18), transparent 55%), radial-gradient(ellipse at 70% 65%, rgba(244,114,182,0.10), transparent 55%)',
          }}
        />
        {/* Subtle SVG noise overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        <div className="relative z-10 max-w-[920px] w-full text-center">
          <div className="mb-7 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-accent">
            &#9656; ViSuReNa &middot; Phase 0 &middot; The catalog you wish existed
          </div>

          <h1
            className="font-sans font-bold text-aurora-text mb-7 tracking-[-0.035em] leading-[1.04]"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 5.6rem)' }}
          >
            Find what{' '}
            <span className="font-italic italic font-normal text-aurora-accent">
              comes&nbsp;next
            </span>
            .
          </h1>

          <p className="mx-auto mb-12 max-w-[640px] text-aurora-text-mid text-[16px] sm:text-[19px] leading-[1.6]">
            A streaming search engine for what hasn&rsquo;t been made yet. When the audience asks for it,
            ViSuReNa makes it. Crowd-steered. Editorially directed. AI-produced.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className={`mx-auto mb-6 max-w-[720px] flex items-center gap-2 sm:gap-3 bg-aurora-surface/65 backdrop-blur-xl rounded-2xl border transition-[border-color,box-shadow] duration-200 ease-out h-16 sm:h-20 pl-4 sm:pl-6 pr-2 ${
              searchFocused
                ? 'border-aurora-accent shadow-[0_0_0_4px_rgba(107,125,255,0.22)]'
                : 'border-aurora-accent/30'
            }`}
          >
            <MagnifyingGlassIcon className="flex-shrink-0 h-5 w-5 text-aurora-text-mid" />
            <div className="flex-1 relative h-full flex items-center min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                autoComplete="off"
                aria-label="Search what comes next"
                className={`w-full bg-transparent border-0 outline-none text-aurora-text font-sans font-normal text-[15px] sm:text-[18px] placeholder:text-aurora-text-muted transition-opacity duration-500 ${
                  placeholderVisible ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
            <button
              type="submit"
              className="bg-aurora-accent hover:bg-[#5566E0] active:scale-[0.98] text-white font-sans font-semibold text-[13px] sm:text-[14px] tracking-[0.02em] px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-[background,transform] duration-200"
            >
              Search
            </button>
          </form>

          {/* WHY input */}
          <div className="mx-auto mb-14 max-w-[720px] text-left">
            <div className="mb-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-aurora-text-muted">
              // Add the WHY &middot; powers our recommendation engine
            </div>
            <input
              type="text"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="What hooked you. Plot, mood, a single image…"
              className="w-full bg-transparent border-0 border-b border-aurora-hairline focus:border-aurora-accent focus:outline-none py-2.5 text-aurora-text font-sans font-italic italic text-[16px] placeholder:text-aurora-text-muted placeholder:italic transition-colors"
            />
          </div>

          {/* Trending pills */}
          <div className="mx-auto mb-14 max-w-[760px]">
            <div className="mb-4 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-accent">
              // TRENDING TONIGHT
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {TRENDING_PILLS.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => fillFromPill(pill)}
                  className="bg-aurora-surface border border-aurora-hairline text-aurora-text-mid hover:text-aurora-text hover:border-aurora-accent hover:bg-aurora-raised font-sans font-normal text-[13px] px-4 py-2 rounded-full transition-[color,border-color,background] duration-200"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Browse hint */}
          <a
            href="#catalog"
            className="block animate-bounce font-mono text-[11px] tracking-[0.14em] uppercase text-aurora-text-muted hover:text-aurora-text-mid transition-colors"
          >
            &darr; Browse the catalog
          </a>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TONIGHT ON VISURENA — catalog row                            */}
      {/* ============================================================ */}
      <section id="catalog" className="px-5 sm:px-8 py-20 sm:py-28">
        <div className="container mx-auto max-w-[1320px]">
          <div className="mb-3.5 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-accent">
            // 12 ITEMS LIVE &middot; UPDATED HOURLY
          </div>
          <h2 className="mb-2 font-sans font-semibold text-[28px] tracking-[-0.02em] text-aurora-text">
            Tonight on visurena.
          </h2>
          <p className="mb-14 max-w-[620px] font-sans text-[16px] text-aurora-text-mid">
            A small, deliberate catalog. Two original tracks, six retro arcade games, a research blog.
            We keep it tight on purpose &mdash; every release is intentional.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-[22px]">
            {/* MUSIC cards */}
            {musicCards.map((track) => (
              <a
                key={track.id}
                href={track.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-aurora-surface border border-aurora-hairline rounded-xl overflow-hidden transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-aurora-accent hover:shadow-[0_16px_40px_-12px_rgba(107,125,255,0.25)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-aurora-raised to-aurora-surface">
                  {track.thumbnail && (
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="px-5 pt-4 pb-5">
                  <div className="mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-aurora-gold">
                    MUSIC
                  </div>
                  <h3 className="mb-2 font-sans font-medium text-[17px] tracking-[-0.01em] text-aurora-text group-hover:text-white transition-colors">
                    {track.title}
                  </h3>
                  <p className="mb-3 font-sans font-italic italic text-[14px] text-aurora-text-mid leading-[1.5]">
                    {track.description}
                  </p>
                  <div className="font-mono text-[11px] tracking-[0.06em] text-aurora-text-muted">
                    // {track.duration || '4:20'} &middot; 2025
                  </div>
                </div>
              </a>
            ))}

            {/* GAME cards */}
            {gameCards.map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`}>
                <article className="group block bg-aurora-surface border border-aurora-hairline rounded-xl overflow-hidden cursor-pointer transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-aurora-accent hover:shadow-[0_16px_40px_-12px_rgba(107,125,255,0.25)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-aurora-raised to-aurora-surface">
                    {/* Decorative aurora wash */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 20% 30%, rgba(181,232,83,0.10), transparent 50%), radial-gradient(circle at 80% 80%, rgba(107,125,255,0.08), transparent 50%)',
                      }}
                    />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span className="font-sans font-bold text-[22px] sm:text-[26px] tracking-[-0.015em] leading-[1.1] text-center px-5 text-aurora-text group-hover:text-white transition-colors">
                        {game.title}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-5">
                    <div className="mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-aurora-lime">
                      GAMES
                    </div>
                    <h3 className="mb-2 font-sans font-medium text-[17px] tracking-[-0.01em] text-aurora-text group-hover:text-white transition-colors">
                      {game.title}
                    </h3>
                    <p className="mb-3 font-sans font-italic italic text-[14px] text-aurora-text-mid leading-[1.5]">
                      {game.description}
                    </p>
                    <div className="font-mono text-[11px] tracking-[0.06em] text-aurora-text-muted">
                      // ARCADE &middot; BROWSER
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Optional blog peek row — surfaces blogPosts from getStaticProps */}
          {blogPosts.length > 0 && (
            <div className="mt-16">
              <div className="mb-3.5 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-accent">
                // FROM THE BUILD LOG
              </div>
              <h3 className="mb-8 font-sans font-semibold text-[22px] tracking-[-0.02em] text-aurora-text">
                Latest dispatches.
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-[22px]">
                {blogPosts.slice(0, 3).map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <article className="group block bg-aurora-surface border border-aurora-hairline rounded-xl overflow-hidden cursor-pointer h-full transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-aurora-accent hover:shadow-[0_16px_40px_-12px_rgba(107,125,255,0.25)]">
                      <div className="px-5 pt-5 pb-5">
                        <div className="mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-aurora-platinum">
                          BLOG
                        </div>
                        <h4 className="mb-2 font-sans font-medium text-[17px] tracking-[-0.01em] text-aurora-text group-hover:text-white transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="mb-3 font-sans font-italic italic text-[14px] text-aurora-text-mid leading-[1.5] line-clamp-2">
                          {post.description}
                        </p>
                        <div className="font-mono text-[11px] tracking-[0.06em] text-aurora-text-muted">
                          // {post.duration || '5 min read'} &middot; {formatDate(post.releaseDate)}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* MANIFESTO                                                    */}
      {/* ============================================================ */}
      <section className="bg-aurora-surface border-t border-b border-aurora-hairline px-5 sm:px-8 py-20 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-7 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-accent">
            // THE THESIS
          </div>

          <h2
            className="mb-14 font-italic italic font-normal text-aurora-accent leading-[1.15] tracking-[-0.02em] max-w-[980px]"
            style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)' }}
          >
            &ldquo;Most platforms ship what&rsquo;s already made. We ship what you ask for.&rdquo;
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            <div>
              <p className="font-sans font-normal text-[17px] leading-[1.7] text-aurora-text-mid">
                Streaming is a back-catalog problem. Even the biggest libraries are limited to what was financed
                five years ago, by people guessing what you&rsquo;d want today. The shelves are full and the search is empty.
              </p>
              <p className="mt-4 font-sans font-normal text-[17px] leading-[1.7] text-aurora-text-mid">
                ViSuReNa flips the order. The search bar comes first. You tell us what&rsquo;s missing &mdash; the film,
                the album, the novel ending, the game mechanic &mdash; and the WHY behind it.
              </p>
            </div>
            <div>
              <p className="font-sans font-normal text-[17px] leading-[1.7] text-aurora-text-mid">
                Demand clusters into signals. Editors pick which signals deserve a real production. Then a hybrid
                pipeline &mdash; human craft plus AI-native tools &mdash; actually ships the thing, with credits, provenance,
                and a release date.
              </p>
              <p className="mt-4 font-sans font-normal text-[17px] leading-[1.7] text-aurora-text-mid">
                It&rsquo;s a streaming platform, but the catalog is a verb. The audience writes the brief.
                We make the work.
              </p>
            </div>
          </div>

          <Link
            href="/brd"
            className="inline-block mt-12 font-sans font-medium text-[14px] text-aurora-accent hover:text-[#8A99FF] transition-colors"
          >
            Read the full BRD &rarr;
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW THE ENGINE WORKS                                         */}
      {/* ============================================================ */}
      <section id="engine" className="px-5 sm:px-8 py-20 sm:py-28">
        <div className="container mx-auto max-w-[1320px]">
          <div className="mb-3.5 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-accent">
            // HOW THE ENGINE WORKS
          </div>
          <h2 className="mb-2 font-sans font-semibold text-[28px] tracking-[-0.02em] text-aurora-text">
            Three steps, plainly.
          </h2>
          <p className="mb-14 max-w-[620px] font-sans text-[16px] text-aurora-text-mid">
            From a single search to a finished release. No mysticism, no ten-step funnel &mdash; just the loop, in order.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {[
              {
                num: '01',
                eyebrow: 'ASK',
                eyebrowColor: 'text-aurora-accent',
                title: 'You ask.',
                desc: 'Type what you wish existed. The films, the songs, the endings, the games. The WHY counts as much as the what — that’s the signal we listen for.',
              },
              {
                num: '02',
                eyebrow: 'DEMAND CLUSTER',
                eyebrowColor: 'text-aurora-cyan',
                title: 'We aggregate.',
                desc: 'Searches collapse into themes. Editors look at clusters of real demand — not vibes, not vanity — and choose the next thing worth making.',
              },
              {
                num: '03',
                eyebrow: 'ORIGINAL',
                eyebrowColor: 'text-aurora-pink',
                title: 'We ship.',
                desc: 'A small, hybrid crew — human craft plus AI-native tools — produces the work, credits the team, and releases it on the platform that asked for it.',
              },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div
                  className="mb-6 font-sans font-bold text-aurora-accent leading-[0.9] tracking-[-0.04em] opacity-95"
                  style={{ fontSize: 'clamp(3.6rem, 8vw, 6rem)' }}
                >
                  {step.num}
                </div>
                <div className={`mb-3 font-mono text-[11px] tracking-[0.18em] uppercase ${step.eyebrowColor}`}>
                  {step.eyebrow}
                </div>
                <h3 className="mb-3.5 font-sans font-italic italic font-semibold text-[22px] tracking-[-0.01em] text-aurora-text">
                  {step.title}
                </h3>
                <p className="max-w-[320px] font-sans font-normal text-[15px] leading-[1.6] text-aurora-text-mid">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const blogPosts = (getAllPosts() || []).map((p: any) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    thumbnail: p.thumbnail,
    duration: p.duration,
    releaseDate: p.releaseDate,
  }));

  return {
    props: {
      blogPosts,
    },
  };
}
