import React from "react";
export function TopStatusBar() {
  return (
    <div className="flex items-center justify-between px-6 py-2 md:px-10 border-b border-jewel-ivory/10 font-mono text-[10px] tracking-label uppercase text-jewel-ivory/40">
      <span>New chapters every Monday</span>
      <span className="text-jewel-amber/80">Free during open beta</span>
    </div>
  );
}
