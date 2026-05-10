import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SnakeEvolution from '../../components/games/SnakeEvolution';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SnakeEvolutionPage() {
  const router = useRouter();

  return (
    <Layout pageTheme="games">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-black">
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
            
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Snake Evolution
            </h1>
            
            <div className="w-24" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="container mx-auto px-4 pb-8"
        >
          <div className="w-full h-[calc(100vh-120px)] min-h-[500px]">
            <SnakeEvolution />
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}