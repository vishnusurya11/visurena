import React, { CSSProperties } from "react";

interface VRStripeProps {
  color?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
}

export function VRStripe({ color = "#e8e3d6", width = 24, height = 1, style = {} }: VRStripeProps) {
  return <span style={{ display: "inline-block", width, height, background: color, verticalAlign: "middle", ...style }} />;
}
