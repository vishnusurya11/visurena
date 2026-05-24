import React from 'react';
import Layout from '../components/Layout';

export default function Story() {
  return (
    <Layout pageTheme="story">
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-theme-story-primary">Story</h1>
          <p className="text-2xl text-gray-400">Coming Soon</p>
        </div>
      </div>
    </Layout>
  );
}