import React from "react";

export function Hero({ eyebrow, title, summary, href, cover }: {
  eyebrow?: string; title: string; summary?: string; href: string; cover?: string;
}) {
  return (
    <section className="relative px-6 md:px-10 pt-16 pb-24 min-h-[60vh] flex flex-col justify-end">
      {cover && (
        <span aria-hidden className="absolute inset-0 -z-0 opacity-40"
          style={{ background: `center/cover no-repeat url(${cover})`,
                   maskImage: "linear-gradient(180deg, transparent, black 60%)",
                   WebkitMaskImage: "linear-gradient(180deg, transparent, black 60%)" }} />
      )}
      <div className="relative max-w-3xl">
        {eyebrow && <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-3">{eyebrow}</p>}
        <h1 className="font-display text-6xl md:text-8xl leading-[0.95] text-jewel-ivory mb-5">{title}</h1>
        {summary && <p className="font-body text-lg text-jewel-ivory/70 mb-6 max-w-xl">{summary}</p>}
        <a href={href} className="font-mono text-xs tracking-label uppercase border border-jewel-ivory/40 px-5 py-3 text-jewel-ivory hover:border-jewel-ivory">Read now →</a>
      </div>
    </section>
  );
}
