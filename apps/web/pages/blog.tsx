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
    <div className="min-h-screen bg-transparent">
      {/* Navigation Back */}
      <div className="border-b border-jewel-ivory/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-jewel-ivory/60 hover:text-jewel-amber transition-colors text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-b border-jewel-ivory/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-jewel-ivory mb-4">
            ViSuReNa Blog
          </h1>
          <p className="text-xl text-jewel-ivory/60 font-body">
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
                    ? 'bg-jewel-amber text-ink-base font-medium'
                    : 'bg-ink-raise text-jewel-ivory/60 border border-jewel-ivory/10 hover:border-jewel-amber hover:text-jewel-amber'
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
            <h2 className="font-display text-2xl font-bold text-jewel-ivory mb-8 pb-4 border-b border-jewel-ivory/10">
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
              <p className="text-jewel-ivory/60 text-lg">
                No posts found with the tag &quot;{selectedTag}&quot;
              </p>
              <button
                onClick={() => setSelectedTag('all')}
                className="mt-4 text-jewel-amber hover:underline"
              >
                View all posts
              </button>
            </div>
          )
        )}

        {/* Empty State */}
        {blogPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-jewel-ivory/60 text-lg mb-4">No blog posts yet</p>
            <p className="text-jewel-ivory/40 text-sm">
              Check back soon for ComfyUI experiments and AI research!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-12 mt-20 border-t border-jewel-ivory/10">
        <div className="text-center text-jewel-ivory/40 text-sm">
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
