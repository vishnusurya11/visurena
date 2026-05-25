"use client";
import React, { useRef, useEffect, ReactNode, CSSProperties, ElementType } from "react";

interface VRFadeProps {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
  className?: string;
  [key: string]: any;
}

export function VRFade({ children, delay = 0, as = "div", style = {}, className = "", ...rest }: VRFadeProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("vr-in"); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { el.classList.add("vr-in"); io.unobserve(el); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as as any;
  return (
    <Tag ref={ref} className={`vr-fade ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
