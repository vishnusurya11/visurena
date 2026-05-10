import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ViSuReNa — Demand-driven AI streaming studio</title>
        <meta name="description" content="A streaming platform where the catalog is shaped by what you ask for. Crowd-steered, editorially directed, AI-produced." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <link rel="icon" href="/favicon.ico" />

        {/* Google Fonts are loaded in pages/_document.tsx (Next.js requires <link rel="stylesheet"> in Document, not next/head) */}

        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0E2A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ViSuReNa" />
        
        {/* Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
        
        {/* Splash Screen */}
        <meta name="apple-mobile-web-app-title" content="ViSuReNa" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#0A0E2A" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}