import React from 'react';
import Layout from '../components/Layout';

export default function VRWorld() {
  return (
    <Layout pageTheme="vr">
      {/* ============== PALETTE STRIP ============== */}
      <section className="bg-aurora-surface border-b border-aurora-hairline">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-[18px] flex flex-wrap items-center justify-between gap-8">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-lavender">
              // VR WORLD &middot; room palette
            </div>
            <div className="font-mono text-[10.5px] tracking-[0.08em] text-aurora-text-muted">
              Immersive worlds &middot; Phase 4d
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[14px] pb-[18px]">
            {[
              { hex: '#A78BFA', bg: 'bg-[#A78BFA]' },
              { hex: '#131A3D', bg: 'bg-[#131A3D]' },
              { hex: '#1D2552', bg: 'bg-[#1D2552]' },
              { hex: '#2A3268', bg: 'bg-[#2A3268]' },
            ].map((s) => (
              <div key={s.hex} className="relative">
                <div
                  className={`w-[60px] h-[60px] sm:w-[60px] sm:h-[60px] rounded-md border border-aurora-hairline ${s.bg}`}
                />
                <span className="absolute -bottom-4 left-0 right-0 text-center font-mono text-[10px] tracking-[0.04em] uppercase text-aurora-text-muted">
                  {s.hex}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden min-h-[50vh] py-[90px] sm:py-[110px]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_60%,rgba(167,139,250,0.13),transparent_50%),radial-gradient(ellipse_at_85%_0%,rgba(107,125,255,0.06),transparent_55%)]" />
        <div className="relative z-10 max-w-[880px] mx-auto px-5 sm:px-8 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-lavender mb-[22px]">
            // VR WORLD &middot; IMMERSIVE &middot; PHASE 4d &middot; THE FAR HORIZON
          </div>
          <h1
            className="font-sans font-bold text-aurora-text mb-[26px]"
            style={{
              fontSize: 'clamp(2rem, 5.6vw, 3.8rem)',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
            }}
          >
            Worlds{' '}
            <span
              className="font-italic italic font-normal text-aurora-lavender"
              style={{ letterSpacing: '-0.01em' }}
            >
              people stand inside.
            </span>
          </h1>
          <p className="font-sans font-normal text-[17px] leading-[1.6] text-aurora-text-mid max-w-[600px] mx-auto mb-8">
            VR is the last medium ViSuReNa expands into. Not because it&apos;s the
            easiest &mdash; because it&apos;s the most demanding. Once short film
            and music prove the demand-first thesis at scale, immersive becomes
            the proving ground. Phase 4d. Likely 2028.
          </p>
          <a
            href="#brief"
            className="inline-flex items-center gap-2 bg-aurora-lavender hover:bg-[#9077E0] text-aurora-bg font-sans font-semibold text-[14px] tracking-[0.02em] px-7 py-[14px] rounded-xl transition-all duration-200 hover:-translate-y-[1px]"
          >
            Read the Phase 4d brief &rarr;
          </a>
          <div className="mt-[22px] font-mono text-[11px] tracking-[0.1em] text-aurora-text-muted">
            // SHIPPED CONTENT: 0 &middot; MEMBER WAITLIST OPENS PHASE 3
          </div>
        </div>
      </section>

      {/* ============== REASONING GRID ============== */}
      <section id="brief" className="pt-[60px] pb-20">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-lavender mb-9">
            // THE BRIEF &middot; WHY IT WAITS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '// 01',
                title: 'The cost is editorial, not technical.',
                body: "By the time we ship a VR world, we'll have shipped four other mediums. The audience will know what we make. The crowd-steered brief will already be tested. VR is where we apply what we learned, not where we learn.",
              },
              {
                num: '// 02',
                title: 'The medium punishes premature commitment.',
                body: 'VR worlds done badly are the worst kind of AI slop — uncanny, sluggish, alone. We hold this room until the production stack and the audience are both ready. Editorial veto, not technical capacity, sets the date.',
              },
              {
                num: '// 03',
                title: 'The crowd has to ask first.',
                body: 'Every other room shipped because demand clusters surfaced. VR is no different — when "I want to walk inside this story" becomes the dominant signal, that’s when Phase 4d opens. Probably 2028. Could be later. Won’t be sooner.',
              },
            ].map((card) => (
              <div
                key={card.num}
                className="group relative bg-aurora-surface border border-aurora-hairline border-t-2 border-t-aurora-lavender rounded-xl p-8 transition-all duration-[220ms] hover:border-aurora-lavender hover:border-t-[3px]"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-lavender mb-[14px]">
                  {card.num}
                </div>
                <h3
                  className="font-sans font-semibold text-[19px] leading-[1.3] text-aurora-text mb-[14px]"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {card.title}
                </h3>
                <p className="font-sans font-normal text-[14.5px] leading-[1.65] text-aurora-text-mid">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SCOPE STRIP ============== */}
      <section className="pt-[60px] pb-20 border-t border-aurora-hairline">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* In scope */}
            <div className="bg-aurora-surface border border-aurora-hairline rounded-xl p-9">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-lavender mb-[22px]">
                // SCOPED FOR PHASE 4d
              </div>
              <ul className="flex flex-col gap-[14px]">
                {[
                  'One short immersive scene (under 5 minutes) tied to a confirmed novel chapter',
                  'Web-based VR (WebXR), no native app — accessible through any modern browser',
                  'Crowd-steered scene selection: members vote which novel chapter becomes the first VR scene',
                  'Editorial direction holds — production AI assists; the cut is human',
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-[22px] font-sans font-normal text-[15px] leading-[1.55] text-aurora-text"
                  >
                    <span className="absolute left-0 top-[9px] w-2 h-px bg-aurora-lavender" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Out of scope */}
            <div className="bg-aurora-surface border border-aurora-hairline rounded-xl p-9">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-text-mid mb-[22px]">
                // EXPLICITLY OUT OF SCOPE
              </div>
              <ul className="flex flex-col gap-[14px]">
                {[
                  'Full-length VR films or games — Phase 5+ at earliest',
                  'Native Quest / Vision Pro apps (web-first principle)',
                  'Multi-user social VR — out of scope per BRD §5.2',
                  'Custom-trained world models — hosted APIs only, per BRD principle',
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-[22px] font-sans font-normal text-[15px] leading-[1.55] text-aurora-text-mid"
                  >
                    <span className="absolute left-0 top-[9px] w-2 h-px bg-aurora-text-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============== EXPLAINER ============== */}
      <section className="pt-10 pb-[100px]">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-aurora-lavender mb-7">
            // HOW VR WORLD FITS
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">
            <div className="space-y-[18px]">
              <p className="font-sans font-normal text-[16px] leading-[1.7] text-aurora-text-mid">
                <strong className="font-semibold text-aurora-text">VR World</strong>{' '}
                is the last medium because it&apos;s the highest-leverage one. By
                the time it ships, ViSuReNa will already have a paying audience,
                a tested editorial spine, and a working demand-cluster engine.
                Immersive is what that compounds into.
              </p>
              <p className="font-sans font-normal text-[16px] leading-[1.7] text-aurora-text-mid">
                Until then, this room sits empty on purpose. Empty rooms are
                honest. We could fake a &ldquo;coming soon&rdquo; grid here, but
                the BRD explicitly rejects that pattern. When VR ships, it ships
                with its first scene already crowd-steered into existence.
              </p>
            </div>
            <div className="space-y-[18px]">
              <p className="font-sans font-normal text-[16px] leading-[1.7] text-aurora-text-mid">
                If you want to be part of it: keep submitting taste inputs to the
                rooms that already exist. The same engine that picks novel
                chapters and music tracks will pick the first VR scene. Your
                input scopes the brief either way.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
