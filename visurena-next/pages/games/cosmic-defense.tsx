import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import CosmicDefense from '../../components/games/CosmicDefense';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CosmicDefensePage() {
  const router = useRouter();

  return (
    <Layout pageTheme="games">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
        {/* Header */}
        <div className="container mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <button
              onClick={() => router.push('/games')}
              className="flex items-center gap-2 text-white hover:text-theme-games-primary transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Games</span>
            </button>
            
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              Cosmic Defense
            </h1>
            
            <div className="w-24" /> {/* Spacer for centering */}
          </motion.div>
        </div>

        {/* Game Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="container mx-auto px-4 pb-8"
        >
          <div className="w-full h-[calc(100vh-120px)] min-h-[500px]">
            <CosmicDefense />
          </div>
        </motion.div>

        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="container mx-auto px-4 pb-8"
        >
          <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4">About Cosmic Defense</h2>
            <p className="text-gray-300 mb-4">
              Defend Earth from waves of alien invaders in this retro-inspired space shooter! 
              Move your ship, dodge enemy fire, and blast through increasingly difficult waves 
              to achieve the highest score.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-games-primary mb-2">How to Play</h3>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• <strong>Desktop:</strong> Use Arrow Keys or WASD to move</li>
                  <li>• <strong>Desktop:</strong> Press Space to shoot</li>
                  <li>• <strong>Mobile:</strong> Touch and drag to move your ship</li>
                  <li>• <strong>Mobile:</strong> Tap the upper screen to shoot</li>
                  <li>• Press ESC to pause (desktop only)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-theme-games-primary mb-2">Game Features</h3>
                <ul className="text-gray-400 space-y-1 text-sm">
                  <li>• Progressive difficulty system</li>
                  <li>• Multiple enemy types with different point values</li>
                  <li>• Particle effects and visual feedback</li>
                  <li>• High score tracking</li>
                  <li>• Responsive controls for all devices</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}