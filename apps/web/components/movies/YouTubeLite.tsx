// components/movies/YouTubeLite.tsx
//
// Click-to-load YouTube player. Before the click: the episode still, a play button and
// "Click to load on YouTube · 10:04" (no third-party bytes). On click: mounts the
// youtube-nocookie iframe (autoplay) at 9:16. A visible "Watch on YouTube ↗" link is
// always present so the player is never the only way in.
//
// URLs are passed in (computed in getStaticProps with lib/movies youtubeEmbedUrl /
// youtubeWatchUrl) so this component stays free of node:fs imports.

import React, { useState } from "react";
import type { VideoAspect } from "../../lib/movies";

export const ASPECT_CSS: Record<VideoAspect, string> = { "9:16": "9 / 16", "1:1": "1 / 1", "16:9": "16 / 9" };

export interface YouTubeLiteProps {
  embedUrl: string;      // youtube-nocookie embed with autoplay=1
  watchUrl: string;      // https://www.youtube.com/watch?v=…
  title: string;         // "Episode 4 · What John Rance Had to Tell"
  still?: string;
  stillPosition?: string;
  runtime?: string;      // "2:23" — always the measured episode.runtime, never a guess
  aspect?: VideoAspect;  // the box's aspect-ratio; the iframe fills the box
  onPlay?: () => void;
  className?: string;
  boxClassName?: string; // sizing of the box (PlayerStage drives height/width per aspect)
}

export function YouTubeLite({ embedUrl, watchUrl, title, still, stillPosition = "50% 50%", runtime, aspect = "9:16", onPlay, className = "", boxClassName = "w-full" }: YouTubeLiteProps) {
  const [loaded, setLoaded] = useState(false);
  const [stillFailed, setStillFailed] = useState(false);

  function play() {
    setLoaded(true);
    onPlay?.();
  }

  return (
    <div className={`flex flex-col items-center ${className}`} data-youtube-lite={loaded ? "loaded" : "poster"}>
      <div
        className={`relative overflow-hidden rounded-card border border-hair bg-vr-bg1 ${boxClassName}`}
        style={{ aspectRatio: ASPECT_CSS[aspect] }}
        data-player-box
        data-aspect={aspect}
      >
        {loaded ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={play}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 block h-full w-full cursor-pointer bg-transparent p-0 text-left"
          >
            {still && !stillFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={still}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: stillPosition }}
                decoding="async"
                onError={() => setStillFailed(true)}
              />
            ) : (
              <span className="absolute inset-0 bg-vr-bg2" aria-hidden />
            )}
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-vr-t1 text-vr-bg0 transition-transform duration-fast group-hover:scale-105 motion-reduce:transform-none"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="ml-[3px]"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span
              className="absolute inset-x-0 bottom-0 pb-3.5 pt-5 text-center font-mono text-[12px] text-vr-t1"
              style={{ background: "linear-gradient(180deg, transparent, rgba(11,12,16,.7))" }}
            >
              {["Click to load on YouTube", runtime].filter(Boolean).join(" · ")}
            </span>
          </button>
        )}
      </div>
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 border-b border-hair-2 pb-px font-mono text-[13px] text-vr-t1 no-underline hover:border-vr-t1"
        data-yt-link
      >
        Watch on YouTube ↗
      </a>
    </div>
  );
}
