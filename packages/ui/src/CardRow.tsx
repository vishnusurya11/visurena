import React from "react";
import { ContentCard, type ContentCardProps } from "./ContentCard";

export function CardRow({ title, eyebrow, items }: {
  title: string; eyebrow?: string; items: ContentCardProps[];
}) {
  return (
    <section className="px-6 md:px-10 my-16">
      {eyebrow && <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-2">{eyebrow}</p>}
      <h2 className="font-display text-4xl md:text-5xl text-jewel-ivory mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((it) => <ContentCard key={it.slug} {...it} />)}
      </div>
    </section>
  );
}
