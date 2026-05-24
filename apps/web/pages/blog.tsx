import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getAllPosts } from '../lib/blog';
import { motion } from 'framer-motion';
import BlogCard from '../components/BlogCard';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  releaseDate: string;
  duration?: string;
  tags?: string[];
  featured?: boolean;
}

interface BlogProps {
  blogPosts: BlogPost[];
}

export default function Blog({ blogPosts }: BlogProps) {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Get featured posts (first 2)
  const featuredPosts = blogPosts.slice(0, 2);

  // Get all other posts
  const regularPosts = blogPosts.slice(2);

  // Get all unique tags
  const allTags = ['all', ...Array.from(new Set(blogPosts.flatMap(item => item.tags || [])))];

  // Filter posts by tag
  const getFilteredPosts = (posts: BlogPost[]) => {
    if (selectedTag === 'all') return posts;
    return posts.filter(post => post.tags?.includes(selectedTag));
  };

  const filteredFeatured = getFilteredPosts(featuredPosts);
  const filteredRegular = getFilteredPosts(regularPosts);

  const handlePostClick = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  return (
    <div className="min-h-screen bg-comfy-bg">
      {/* Navigation Back */}
      <div className="border-b border-comfy-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-comfy-muted hover:text-comfy-accent transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-comfy-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-spectral text-5xl sm:text-6xl font-bold text-comfy-heading mb-4">
            ViSuReNa Blog
          </h1>
          <p className="text-xl text-comfy-text font-sans">
            ComfyUI experiments, AI research, and technical insights
          </p>

          {/* Tag Filter */}
          <div className="mt-8 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  selectedTag === tag
                    ? 'bg-comfy-accent text-white font-medium'
                    : 'bg-comfy-card text-comfy-muted border border-comfy-border hover:border-comfy-accent hover:text-comfy-accent'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Featured Posts Section */}
        {filteredFeatured.length > 0 && (
          <section className="mb-16">
            {filteredFeatured.map((post) => (
              <BlogCard
                key={post.slug}
                title={post.title}
                description={post.description}
                thumbnail={post.thumbnail}
                date={post.releaseDate}
                duration={post.duration}
                tags={post.tags}
                onClick={() => handlePostClick(post.slug)}
                featured={true}
              />
            ))}
          </section>
        )}

        {/* Regular Posts Section */}
        {filteredRegular.length > 0 ? (
          <section>
            <h2 className="font-spectral text-2xl font-bold text-comfy-heading mb-8 pb-4 border-b border-comfy-border">
              All Posts
            </h2>
            {filteredRegular.map((post) => (
              <BlogCard
                key={post.slug}
                title={post.title}
                description={post.description}
                thumbnail={post.thumbnail}
                date={post.releaseDate}
                duration={post.duration}
                tags={post.tags}
                onClick={() => handlePostClick(post.slug)}
                featured={false}
              />
            ))}
          </section>
        ) : (
          selectedTag !== 'all' && (
            <div className="text-center py-20">
              <p className="text-comfy-muted text-lg">
                No posts found with the tag "{selectedTag}"
              </p>
              <button
                onClick={() => setSelectedTag('all')}
                className="mt-4 text-comfy-accent hover:underline"
              >
                View all posts
              </button>
            </div>
          )
        )}

        {/* Empty State */}
        {blogPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-comfy-muted text-lg mb-4">No blog posts yet</p>
            <p className="text-comfy-text text-sm">
              Check back soon for ComfyUI experiments and AI research!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-12 mt-20 border-t border-comfy-border">
        <div className="text-center text-comfy-muted text-sm">
          <p>© 2025 ViSuReNa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const blogPosts = getAllPosts();

  return {
    props: {
      blogPosts: blogPosts.map(p => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        thumbnail: p.thumbnail,
        releaseDate: p.releaseDate,
        duration: p.duration,
        tags: p.tags || [],
        featured: p.featured || false,
      })),
    },
  };
}
