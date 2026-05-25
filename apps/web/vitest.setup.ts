import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia; stub it for components that read it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

// jsdom doesn't implement IntersectionObserver; stub it for scroll-reveal components.
if (!("IntersectionObserver" in globalThis)) {
  class StubIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    StubIntersectionObserver;
}

// jsdom throws on canvas getContext; return null so canvas components bail out cleanly.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
