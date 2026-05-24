import React from 'react';
import Layout from '../components/Layout';

export default function Story() {
  return (
    <Layout pageTheme="story">
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] tracking-label uppercase text-jewel-amber/80 mb-4">Stories</p>
        <h1 className="font-display text-6xl md:text-7xl text-jewel-ivory mb-3">Coming soon</h1>
        <p className="font-body text-jewel-ivory/60 max-w-md">Written fiction, published every Monday.</p>
      </section>
    </Layout>
  );
}
