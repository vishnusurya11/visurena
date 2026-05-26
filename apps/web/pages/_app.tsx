import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider, NebulaBackground, VRScrollProgress } from "@visurena/ui";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Visurena</title>
        <meta name="description" content="Visurena — a cinematic creative studio. Stories, films, music, and games." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Spectral:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;600&family=DM+Serif+Display:ital@0;1&family=Instrument+Serif:ital@0;1&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Visurena" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </Head>
      {(() => {
        const section = (pageProps as any).section ?? "stories";
        const isHome = section === "home";
        // Home is its own "Diamond" hub: section="home" → ivory accent (no jewel
        // dominates), and the studio nebula shows all four jewel clouds at once.
        return (
          <ThemeProvider section={section}>
            <VRScrollProgress />
            <NebulaBackground variant={isHome ? "studio" : "section"} />
            <Component {...pageProps} />
          </ThemeProvider>
        );
      })()}
    </>
  );
}
