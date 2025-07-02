import React, { useState } from 'react';
import Layout from '../components/Layout';
import ContentGrid from '../components/ContentGrid';
import Modal from '../components/Modal';
import { getAllPosts } from '../lib/blog';
import { motion } from 'framer-motion';

export default function Blog({ blogPosts }) {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleItemClick = (item) => {
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const allTags = ['all', ...Array.from(new Set(blogPosts.flatMap(item => item.tags || [])))] as string[];
  const filteredPosts = filter === 'all' 
    ? blogPosts 
    : blogPosts.filter(item => item.tags?.includes(filter));

  return (
    <Layout pageTheme="blog">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-theme-blog-primary">Blog</h1>
          <p className="text-lg mb-6 text-netflix-gray">Thoughts, tutorials, and insights</p>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-1 text-sm transition-colors ${
                  filter === tag
                    ? 'text-theme-blog-primary border-b-2 border-theme-blog-primary'
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
          items={filteredPosts}
          variant="grid"
          onItemClick={handleItemClick}
        />

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No blog posts found with the selected filter.</p>
          </div>
        )}
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
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedContent?.tags?.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-netflix-dark text-netflix-gray rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
          {selectedContent?.readUrl && (
            <a 
              href={selectedContent.readUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-theme-blog-primary text-white rounded hover:opacity-90 transition-opacity"
            >
              Read Post
            </a>
          )}
        </div>
      </Modal>
    </Layout>
  );
}

export async function getStaticProps() {
  const blogPosts = getAllPosts();
  
  return {
    props: {
      blogPosts,
    },
  };
}