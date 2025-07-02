import React, { useState } from 'react';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';
import Modal from '../components/Modal';
import contentData from '../content-config.json';
import { motion } from 'framer-motion';

export default function Games() {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleItemClick = (item) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const allTags = ['all', ...new Set(contentData.games.flatMap(item => item.tags || []))];
  const filteredGames = filter === 'all' 
    ? contentData.games 
    : contentData.games.filter(item => item.tags?.includes(filter));

  return (
    <Layout pageTheme="games">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-page-games">Games</h1>
          <p className="text-lg mb-6 text-netflix-gray">Interactive gaming experiences</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-1 text-sm transition-colors ${
                  filter === tag
                    ? 'text-page-games border-b-2 border-page-games'
                    : 'text-netflix-gray hover:text-netflix-text'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-theme-games-primary mb-4">Coming Soon</h2>
            <p className="text-netflix-gray text-lg mb-8">
              Interactive gaming experiences are currently in development. 
              Stay tuned for exciting game releases!
            </p>
            <div className="w-16 h-1 bg-theme-games-primary mx-auto rounded"></div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContent(null);
        }}
        title={selectedContent?.title}
        videoUrl={selectedContent?.videoUrl}
      />
    </Layout>
  );
}