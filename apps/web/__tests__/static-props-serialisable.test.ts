// Next's static export fails on `undefined` anywhere in getStaticProps output. Unit tests of
// the pages render fine with undefined, so this guards the build: every page's props must
// survive a JSON round trip unchanged.
import { describe, it, expect } from "vitest";
import * as Home from "@/pages/index";
import * as Movies from "@/pages/movies";
import * as SeriesPage from "@/pages/movies/[series]";
import * as EpisodePage from "@/pages/movies/[series]/[episode]";
import * as Stories from "@/pages/stories/index";
import * as Music from "@/pages/music";
import * as Games from "@/pages/games";
import * as Requests from "@/pages/requests";

function hasUndefined(v: unknown, path = "props"): string | null {
  if (v === undefined) return path;
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) { const r = hasUndefined(v[i], `${path}[${i}]`); if (r) return r; }
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) { const r = hasUndefined(x, `${path}.${k}`); if (r) return r; }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function propsOf(mod: any, params?: Record<string, string>) {
  const res = await mod.getStaticProps({ params });
  return res.props;
}

describe("getStaticProps output is JSON-serialisable (static export)", () => {
  const simple = { Home, Movies, Stories, Music, Games, Requests };
  for (const [name, mod] of Object.entries(simple)) {
    it(`${name} has no undefined values`, async () => {
      expect(hasUndefined(await propsOf(mod))).toBeNull();
    });
  }

  it("every series page has no undefined values", async () => {
    const { paths } = await SeriesPage.getStaticPaths!({});
    for (const p of paths as Array<{ params: Record<string, string> }>) {
      expect(hasUndefined(await propsOf(SeriesPage, p.params))).toBeNull();
    }
  });

  it("every episode page has no undefined values", async () => {
    const { paths } = await EpisodePage.getStaticPaths!({});
    expect((paths as unknown[]).length).toBeGreaterThan(0);
    for (const p of paths as Array<{ params: Record<string, string> }>) {
      expect(hasUndefined(await propsOf(EpisodePage, p.params))).toBeNull();
    }
  });
});
