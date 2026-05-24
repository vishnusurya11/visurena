import React from "react";

export interface ContentCardProps {
  section: string; slug: string; title: string;
  genre?: string; accent: string; cover?: string;
}

export function ContentCard({ section, slug, title, genre, accent, cover }: ContentCardProps) {
  return (
    <a href={`/${section}/${slug}`}
       className="group relative block aspect-[3/4] overflow-hidden border border-jewel-ivory/10"
       style={{ background: cover ? `center/cover no-repeat url(${cover})` : "#16161a" }}>
      <span className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.85) 100%)` }} />
      <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: accent, opacity: .7 }} />
      {genre && (
        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-label uppercase text-jewel-ivory/70">{genre}</span>
      )}
      <span className="absolute left-3 bottom-3 right-3 font-display text-xl leading-tight text-jewel-ivory">{title}</span>
    </a>
  );
}
