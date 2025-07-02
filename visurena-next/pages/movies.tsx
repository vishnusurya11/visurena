import React, { useState } from 'react';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';
import Modal from '../components/Modal';
import contentData from '../content-config.json';
import { motion } from 'framer-motion';

export default function Movies() {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleItemClick = (item) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  // Get unique tags from movies
  const allTags = ['all', ...Array.from(new Set(contentData.movies.flatMap(movie => movie.tags || [])))] as string[];

  // Filter movies based on selected tag
  const filteredMovies = filter === 'all' 
    ? contentData.movies 
    : contentData.movies.filter(movie => movie.tags?.includes(filter));

  return (
    <Layout pageTheme="movies">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-theme-movies-primary">Movies</h1>
          <p className="text-lg mb-6 text-netflix-gray">Films, documentaries, and visual experiences</p>
          
          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-1 text-sm transition-colors ${
                  filter === tag
                    ? 'text-theme-movies-primary border-b-2 border-theme-movies-primary'
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
          items={filteredMovies}
          variant="grid"
          onItemClick={handleItemClick}
        />

        {filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No movies found with the selected filter.</p>
          </div>
        )}
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