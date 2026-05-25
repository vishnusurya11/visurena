"use client";
import React, { useRef, useEffect, useState, CSSProperties, ElementType } from "react";

interface VRCounterProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  as?: ElementType;
  style?: CSSProperties;
  [key: string]: any;
}

export function VRCounter({ value, duration = 1500, format = (n: number) => String(Math.round(n)), as = "span", style = {}, ...rest }: VRCounterProps) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let startedAt = 0;
    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(eased * value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { raf = requestAnimationFrame(tick); io.unobserve(el); }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [value, duration]);
  const Tag = as as any;
  return <Tag ref={ref} style={style} {...rest}>{format(n)}</Tag>;
}
