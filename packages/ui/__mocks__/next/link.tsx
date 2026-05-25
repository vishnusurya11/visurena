import React from "react";

// Minimal stub for next/link used in vitest (jsdom) test environment.
// Renders a plain <a> so link-role queries work in tests.
export default function Link({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
