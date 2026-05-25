"use client";
import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";

function useMouseTilt(ref: React.RefObject<HTMLElement>, { maxRot = 6, lift = 8, sheen = true } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", `${(0.5 - y) * maxRot}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * maxRot}deg`);
        el.style.setProperty("--ty", `${-lift}px`);
        if (sheen) {
          el.style.setProperty("--mx", `${x * 100}%`);
          el.style.setProperty("--my", `${y * 100}%`);
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--ty", "0px");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [maxRot, lift, sheen]);
}

interface VRTiltProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxRot?: number;
  lift?: number;
  sheen?: boolean;
}

export function VRTilt({ children, className = "", style = {}, maxRot = 6, lift = 8, sheen = true }: VRTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  useMouseTilt(ref, { maxRot, lift, sheen });
  return (
    <div ref={ref} className={`vr-tilt ${sheen ? "vr-sheen" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}
