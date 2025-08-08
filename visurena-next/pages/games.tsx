import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';
import { motion } from 'framer-motion';
import contentConfig from '../content-config.json';

export default function Games() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  
  const games = contentConfig.games || [];

  const handleItemClick = (item) => {
    // Navigate to the game page
    router.push(`/games/${item.slug}`);
  };

  const allTags = ['all', ...Array.from(new Set(games.flatMap(item => item.tags || [])))] as string[];
  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(item => item.tags?.includes(filter));

  return (
    <Layout pageTheme="games">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-theme-games-primary">Games</h1>
          <p className="text-lg mb-6 text-netflix-gray">Play exciting games right in your browser</p>
          
          {allTags.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`px-4 py-1 text-sm transition-colors ${
                    filter === tag
                      ? 'text-theme-games-primary border-b-2 border-theme-games-primary'
                      : 'text-netflix-gray hover:text-netflix-text'
                  }`}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {filteredGames.length > 0 ? (
          <ContentGrid
            title=""
            items={filteredGames}
            variant="grid"
            onItemClick={handleItemClick}
          />
        ) : (
          <div className="text-center py-20">
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-block p-8 bg-gradient-to-br from-theme-games-primary/20 to-theme-games-secondary/20 rounded-2xl"
              >
                <svg className="w-24 h-24 text-theme-games-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.47 11.293L12.177 8l-3.293 3.293a1 1 0 101.414 1.414L11.47 11.536V15a1 1 0 102 0v-3.464l1.172 1.171a1 1 0 101.414-1.414h-.586zM12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                </svg>
              </motion.div>
            </div>
            <p className="text-xl text-gray-500">Loading games...</p>
          </div>
        )}
      </div>
    </Layout>
  );
}