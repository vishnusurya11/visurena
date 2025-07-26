import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

// Temporary wiki articles data
const wikiArticles = [
  {
    id: 'wiki-1',
    type: 'wiki',
    title: 'Building AI Agents with LangChain',
    description: 'Deep dive into creating intelligent agents using LangChain framework',
    thumbnail: '/images/langchain-agents.jpg',
    tags: ['AI', 'LangChain', 'Agents'],
    date: '2025-01-20',
    readTime: '15 min'
  },
  {
    id: 'wiki-2',
    type: 'wiki',
    title: 'Strands: Next-Gen AI Agents',
    description: 'Exploring Strands framework for building autonomous AI systems',
    thumbnail: '/images/strands-agents.jpg',
    tags: ['AI', 'Strands', 'Automation'],
    date: '2025-01-18',
    readTime: '12 min'
  },
  {
    id: 'wiki-3',
    type: 'wiki',
    title: 'The Art of Songwriting: A Technical Analysis',
    description: 'Breaking down song structure, melody, and lyrical composition',
    thumbnail: '/images/songwriting.jpg',
    tags: ['Music', 'Creativity', 'Analysis'],
    date: '2025-01-15',
    readTime: '20 min'
  },
  {
    id: 'wiki-4',
    type: 'wiki',
    title: 'ViSuReNa Development Journey',
    description: 'Building a Netflix-style platform from scratch - lessons learned',
    thumbnail: '/images/visurena-dev.jpg',
    tags: ['Development', 'Next.js', 'AWS'],
    date: '2025-01-10',
    readTime: '10 min'
  }
];

export default function Wiki() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleArticleClick = (article) => {
    // For now, just log - later will open article viewer
    console.log('Opening article:', article);
    // Later: router.push(`/wiki/${article.id}`);
  };

  return (
    <Layout pageTheme="wiki">
      <div className="container mx-auto px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-purple-400">Wiki & Research</h1>
          <p className="text-lg mb-8 text-netflix-gray">
            Technical analysis, development insights, and creative research
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {wikiArticles.map((article) => (
              <motion.div
                key={article.id}
                whileHover={{ scale: 1.03 }}
                className="bg-netflix-card rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handleArticleClick(article)}
              >
                <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/20">Wiki</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-netflix-gray mb-4 line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400">{article.readTime}</span>
                    <span className="text-netflix-gray">{article.date}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-netflix-card rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">More Research Coming Soon</h2>
            <p className="text-netflix-gray">
              Deep dives into AI, music production, game development, and creative technologies
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}