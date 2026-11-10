import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from "@visurena/ui";

export default function App({ Component, pageProps }: AppProps) {
  // ThemeProvider stays for the untouched legacy pages that read it; the Cinema Lobby pages set
  // --vr-accent themselves via LobbyShell.
  const section = (pageProps as { section?: string }).section ?? "stories";
  return (
    <>
      <Head>
        <title>Visurena</title>
        <meta name="description" content="Visurena — stories, movies, music, games. You choose what's next." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Cinema Lobby: Geist + Geist Mono */}
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Legacy serif stack, kept until the remaining detail pages are migrated */}
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Spectral:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;600&family=DM+Serif+Display:ital@0;1&family=Instrument+Serif:ital@0;1&family=Crimson+Pro:ital,wght@0,400;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B0C10" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Visurena" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#0B0C10" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </Head>
      <ThemeProvider section={section}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
