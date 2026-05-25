"use client";
import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";

interface VRMagneticProps {
  children: ReactNode;
  strength?: number;
  range?: number;
  className?: string;
  style?: CSSProperties;
}

export function VRMagnetic({ children, strength = 0.22, range = 120, className = "", style = {} }: VRMagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < range) {
        const f = 1 - d / range;
        el.style.transform = `translate3d(${dx * strength * f}px, ${dy * strength * f}px, 0)`;
      } else {
        el.style.transform = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [strength, range]);
  return <span ref={ref} className={`vr-magnetic ${className}`} style={style}>{children}</span>;
}
