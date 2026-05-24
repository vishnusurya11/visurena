import React from "react";

export function NewsletterCTA() {
  return (
    <section className="px-6 md:px-10 my-24 text-center">
      <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-4">✦ The Monday Post ✦</p>
      <h2 className="font-display text-5xl md:text-6xl text-jewel-ivory leading-tight max-w-3xl mx-auto">
        New chapters in your inbox, <em className="text-jewel-amber not-italic font-display italic">every Monday morning.</em>
      </h2>
      <p className="font-body text-jewel-ivory/60 mt-5 max-w-xl mx-auto">
        One short story, one essay, one piece of music we made that week. No tracking, no ads. Free during open beta.
      </p>
    </section>
  );
}
