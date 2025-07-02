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
          title="Movies & Videos"
          items={recentMovies}
          onItemClick={handleItemClick}
        />
        
        <ContentGrid
          title="Music & Audio"
          items={recentMusic}
          onItemClick={handleItemClick}
        />
        
        <ContentGrid
          title="Games"
          items={recentGames}
          onItemClick={handleItemClick}
        />
        
        {recentStories.length > 0 && (
          <ContentGrid
            title="Stories & Writing"
            items={recentStories}
            onItemClick={handleItemClick}
          />
        )}
        
        {recentBlogs.length > 0 && (
          <ContentGrid
            title="Latest Blog Posts"
            items={recentBlogs}
            onItemClick={handleItemClick}
          />
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

export async function getStaticProps() {
  const blogPosts = getAllPosts();
  
  return {
    props: {
      blogPosts,
    },
  };
}