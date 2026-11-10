// components/movies/CastShelf.tsx
//
// Cast portraits, 3:4, six across (3 on tablet, 2 on phone). A missing portrait falls
// back to the initials tile from the mockup (.face .ini) instead of a broken image.

import React, { useState } from "react";
import type { CastMember } from "../../lib/movies";
import { initials } from "./helpers";

function Portrait({ m }: { m: CastMember }) {
  const [failed, setFailed] = useState(false);
  const showImg = !!m.portrait && !failed;
  return (
    <div className="block" data-cast-member={m.id}>
      <div className="relative w-full overflow-hidden rounded-card border border-hair bg-vr-bg2" style={{ aspectRatio: "3 / 4" }}>
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.portrait}
            alt={m.name}
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 30%" }}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-[28px] font-medium tracking-[-0.02em] text-vr-t2"
            aria-label={m.name}
            data-initials
          >
            {initials(m.name)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-0.5 pb-1.5 pt-2.5">
        {m.role ? <span className="font-mono text-[12px] text-vr-t3">{m.role}</span> : null}
        <b className="text-[14px] font-medium leading-[1.3] text-vr-t1">{m.name}</b>
      </div>
    </div>
  );
}

export function CastShelf({ cast }: { cast: CastMember[] }) {
  if (!cast.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 py-2 md:grid-cols-3 lg:grid-cols-6" data-cast-shelf>
      {cast.map((m) => <Portrait key={m.id} m={m} />)}
    </div>
  );
}
