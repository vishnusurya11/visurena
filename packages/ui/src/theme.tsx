import React, { createContext, useContext, useMemo } from "react";
import { sectionAccent } from "@visurena/design-tokens";

interface ThemeValue { section: string; accent: string; itemAccent?: string; }
const ThemeContext = createContext<ThemeValue>({ section: "stories", accent: "#f5b831" });

export function ThemeProvider({
  section = "stories", itemAccent, children,
}: { section?: string; itemAccent?: string; children: React.ReactNode }) {
  const value = useMemo<ThemeValue>(
    () => ({ section, itemAccent, accent: itemAccent ?? sectionAccent(section) }),
    [section, itemAccent]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
