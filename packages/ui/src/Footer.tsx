import React from "react";
export function Footer() {
  return (
    <footer className="px-6 md:px-10 py-12 mt-24 border-t border-jewel-ivory/10 font-mono text-[11px] tracking-label uppercase text-jewel-ivory/40">
      <div className="flex flex-wrap justify-between gap-6">
        <span>© {new Date().getFullYear()} Visurena</span>
        <span>Stories · Movies · Music · Games · Research</span>
      </div>
    </footer>
  );
}
