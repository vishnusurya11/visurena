import React from 'react';
import Layout from '../components/Layout';

export default function VRWorld() {
  return (
    <Layout pageTheme="vr">
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-theme-vr-primary">VR World</h1>
          <p className="text-2xl text-gray-400">Coming Soon</p>
          <p className="text-lg text-gray-500 mt-4">Immersive virtual reality experiences</p>
        </div>
      </div>
    </Layout>
  );
}