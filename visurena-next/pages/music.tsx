import React, { useState } from 'react';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';
import Modal from '../components/Modal';
import contentData from '../content-config.json';
import { motion } from 'framer-motion';

export default function Music() {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleItemClick = (item) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const allTags = ['all', ...Array.from(new Set(contentData.music.flatMap(item => item.tags || [])))] as string[];
  const filteredMusic = filter === 'all' 
    ? contentData.music 
    : contentData.music.filter(item => item.tags?.includes(filter));

  return (
    <Layout pageTheme="music">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-theme-music-primary">Music</h1>
          <p className="text-lg mb-6 text-netflix-gray">Musical creations and soundscapes</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-1 text-sm transition-colors ${
                  filter === tag
                    ? 'text-theme-music-primary border-b-2 border-theme-music-primary'
                    : 'text-netflix-gray hover:text-netflix-text'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <ContentGrid
          title=""
          items={filteredMusic}
          variant="grid"
          onItemClick={handleItemClick}
        />
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