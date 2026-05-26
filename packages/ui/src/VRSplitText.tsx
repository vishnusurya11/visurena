"use client";
import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";

interface VRSplitTextProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
  style?: CSSProperties;
}

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node) && node.props) return extractText((node.props as any).children);
  return "";
}

export function VRSplitText({ children, stagger = 30, className = "", style = {} }: VRSplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.querySelectorAll<HTMLElement>(".vr-split-letter").forEach(n => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          el.querySelectorAll<HTMLElement>(".vr-split-letter").forEach((n, i) => {
            setTimeout(() => n.classList.add("is-in"), i * stagger);
          });
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [stagger]);

  const text = extractText(children);
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="vr-split-word">
            {word.split("").map((ch, ci) => (
              <span key={ci} className="vr-split-letter">{ch}</span>
            ))}
          </span>
          {wi < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </span>
  );
}
