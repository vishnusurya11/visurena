import React from "react";
import { SECTIONS } from "@visurena/design-tokens";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      <a href="/" className="font-display text-2xl tracking-[0.25em] text-jewel-ivory">
        VISURENA
      </a>
      <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-label uppercase">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`/${s.id}`} className="text-jewel-ivory/70 hover:text-jewel-ivory">
            {s.label}
          </a>
        ))}
        <a href="/research" className="text-jewel-ivory/70 hover:text-jewel-ivory">Research</a>
      </nav>
      <button className="font-mono text-xs tracking-label uppercase border border-jewel-ivory/30 px-4 py-2 text-jewel-ivory/90 hover:border-jewel-ivory/60">
        Sign In
      </button>
    </header>
  );
}
