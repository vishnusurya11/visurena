import React, { ReactNode, CSSProperties } from "react";

interface VRMarqueeProps {
  children: ReactNode;
  gap?: number;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

export function VRMarquee({ children, gap = 64, speed = 32, className = "", style = {} }: VRMarqueeProps) {
  return (
    <div className={`vr-marquee ${className}`} style={style}>
      <div className="vr-marquee-track" style={{ gap, animationDuration: `${speed}s` }}>
        {children}
        {children}
      </div>
    </div>
  );
}
