"use client";
import React, { useRef, useEffect } from "react";

export function VRScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
        const p = Math.min(1, Math.max(0, window.scrollY / max));
        if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);
  return <div ref={ref} className="vr-scroll-progress" />;
}
