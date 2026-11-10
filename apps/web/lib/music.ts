// apps/web/lib/music.ts
//
// The Music catalogue: two released singles (original songs + original music videos).
// Pure data + pure helpers, safe to import from client code (no fs). Copied out of
// pages/music.tsx so Home (Lane 2) and the Music page (Lane 5) read the same list.
//
// OWNER RULE: the audiobook is NOT a music item — it lives on the series page under Extras.

export interface Track {
  slug: string;
  title: string;
  videoUrl: string;      // public URL, mp4
  posterUrl: string;     // public URL, 1:1 cover
  genreTags: string;
  seconds: number;
  releaseDate: string;   // ISO date
  featured: boolean;
  tint: string;          // per-track accent (hex)
  story: string;         // one-paragraph summary of what the song is about
  bpm?: number;
  keyScale?: string;
  vocalist?: string;
}

const TRACKS: Track[] = [
  {
    slug: "somebody-knew-my-name",
    title: "Somebody Knew My Name",
    videoUrl: "/music/somebody-knew-my-name/video.mp4",
    posterUrl: "/music/somebody-knew-my-name/poster.jpg",
    genreTags: "Cinematic orchestral folk-pop",
    bpm: 116,
    keyScale: "D minor",
    seconds: 62,
    vocalist: "Warm young female",
    story:
      "A boy nobody wanted discovers he was known all along; he crosses into a world where his name means something; the mirror shows him the family he'll never have; he learns the treasure isn't the stone — it's choosing to stand for the people who chose him.",
    releaseDate: "2026-08-02",
    featured: true,
    tint: "#c07dd9",
  },
  {
    slug: "last-train",
    title: "Last Train",
    videoUrl: "/music/last-train/video.mp4",
    posterUrl: "/music/last-train/poster.jpg",
    genreTags: "Anime ending ballad · J-pop storytelling",
    bpm: 112,
    keyScale: "A minor",
    seconds: 62,
    vocalist: "Female airy alto",
    story:
      "Years ago she said goodbye to someone on this platform — the last train took them away; she kept the ticket. She returns at night, sings the memory, and tonight she finally boards the train herself. Boarding = letting go. The final chorus is sung in motion; the outro leaves the ticket behind.",
    releaseDate: "2026-08-02",
    featured: false,
    tint: "#5c8fd6",
  },
];

/** Every released single, newest first (stable on equal dates: featured first). */
export function getTracks(): Track[] {
  return [...TRACKS].sort((a, b) => {
    if (a.releaseDate !== b.releaseDate) return a.releaseDate < b.releaseDate ? 1 : -1;
    return Number(b.featured) - Number(a.featured);
  });
}

export function getTrackBySlug(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

/** The single to lead with: the featured one, else the newest. */
export function getFeaturedTrack(): Track | undefined {
  const all = getTracks();
  return all.find((t) => t.featured) ?? all[0];
}

/** "m:ss" from seconds; "h:mm:ss" past an hour; "—" for nonsense. */
export function formatTrackRuntime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Status-line grammar for a single: `Single · Released · 1:02`. */
export function trackStatusParts(t: Track): string[] {
  return ["Single", "Released", formatTrackRuntime(t.seconds)];
}
