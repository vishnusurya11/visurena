import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = (query: string) => ({
    matches, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

describe("usePrefersReducedMotion", () => {
  beforeEach(() => mockMatchMedia(false));
  it("returns false when motion is allowed", () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
  it("returns true when the user prefers reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});
