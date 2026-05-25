"use client";
import React, { useRef, useEffect } from "react";

export function VRCursorDot() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) { el.style.display = "none"; return; }
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; el.style.opacity = "1"; };
    const onLeave = () => { el.style.opacity = "0"; };
    const onOver = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.("a, button, [role=button]");
      const cta = (e.target as Element)?.closest?.(".vr-cta-solid");
      el.classList.toggle("is-link", !!target);
      el.classList.toggle("is-cta", !!cta);
    };
    window.addEventListener("mousemove", onMove);
    document.body.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);
  return <div ref={ref} className="vr-cursor" style={{ opacity: 0 }} />;
}
