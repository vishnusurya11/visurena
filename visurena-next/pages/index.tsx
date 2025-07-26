import React, { useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import ContentGrid from '../components/ContentGrid';
import Modal from '../components/Modal';
import contentData from '../content-config.json';
import { getAllPosts } from '../lib/blog';

export default function Home({ blogPosts }) {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlay = (content) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleMoreInfo = (content) => {
    // For now, just play the video. Later can show details page
    handlePlay(content);
  };

  const handleItemClick = (item) => {
    handlePlay(item);
  };

  // Get recent content from all categories
  const recentMovies = contentData.movies.slice(0, 5);
  const recentMusic = contentData.music.slice(0, 5);
  const recentGames = contentData.games.slice(0, 5);
  const recentStories = contentData.stories.slice(0, 5);
  const recentBlogs = blogPosts?.slice(0, 5) || [];

  return (
    <Layout pageTheme="home">
      <Hero 
        featuredContent={contentData.featured}
        onPlay={handlePlay}
        onMoreInfo={handleMoreInfo}
      />
      
      <div className="container mx-auto px-6 py-8">
        <ContentGrid
          title="Music & Audio"
          items={recentMusic}
          onItemClick={handleItemClick}
        />
        
        {recentBlogs.length > 0 && (
          <ContentGrid
            title="Latest Blog Posts"
            items={recentBlogs}
            onItemClick={handleItemClick}
          />
        )}
        
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold mb-4 text-netflix-text">More Coming Soon</h2>
          <p className="text-lg text-netflix-gray mb-8">
            Movies, Games, Stories, VR World, and Wiki sections are currently under development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-netflix-dark rounded-lg text-netflix-gray">Movies</div>
            <div className="px-4 py-2 bg-netflix-dark rounded-lg text-netflix-gray">Games</div>
            <div className="px-4 py-2 bg-netflix-dark rounded-lg text-netflix-gray">Stories</div>
            <div className="px-4 py-2 bg-netflix-dark rounded-lg text-netflix-gray">VR World</div>
            <div className="px-4 py-2 bg-netflix-dark rounded-lg text-netflix-gray">Wiki</div>
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

export async function getStaticProps() {
  const blogPosts = getAllPosts();
  
  return {
    props: {
      blogPosts,
    },
  };
}