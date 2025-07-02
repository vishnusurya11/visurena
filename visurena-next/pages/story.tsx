import React, { useState } from 'react';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';
import Modal from '../components/Modal';
import contentData from '../content-config.json';
import { motion } from 'framer-motion';

export default function Story() {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleItemClick = (item) => {
    // For stories, we could open a reader modal or redirect
    // For now, show info modal
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const allTags = ['all', ...Array.from(new Set(contentData.stories.flatMap(item => item.tags || [])))] as string[];
  const filteredStories = filter === 'all' 
    ? contentData.stories 
    : contentData.stories.filter(item => item.tags?.includes(filter));

  return (
    <Layout pageTheme="story">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-page-story">Stories</h1>
          <p className="text-lg mb-6 text-netflix-gray">Written works and narrative journeys</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-1 text-sm transition-colors ${
                  filter === tag
                    ? 'text-page-story border-b-2 border-page-story'
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
            <h2 className="text-3xl font-bold text-theme-story-primary mb-4">Coming Soon</h2>
            <p className="text-netflix-gray text-lg mb-8">
              Written works and narrative journeys are being crafted. 
              Amazing stories are on their way!
            </p>
            <div className="w-16 h-1 bg-theme-story-primary mx-auto rounded"></div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContent(null);
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedContent?.title}</h2>
          <p className="text-gray-300 mb-4">{selectedContent?.description}</p>
          <p className="text-sm text-gray-500 mb-4">Reading time: {selectedContent?.duration}</p>
          {selectedContent?.readUrl && (
            <a 
              href={selectedContent.readUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-theme-story-primary text-white rounded hover:opacity-90 transition-opacity"
            >
              Read Story
            </a>
          )}
        </div>
      </Modal>
    </Layout>
  );
}