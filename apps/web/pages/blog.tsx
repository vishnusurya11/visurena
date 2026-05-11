import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import BlogCard from '../components/BlogCard';
import { getAllPosts } from '../lib/blog';

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

  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;
  const regularPosts = blogPosts.slice(1);

  const allTags = ['all', ...Array.from(new Set(blogPosts.flatMap(item => item.tags || [])))];

  const getFilteredPosts = (posts: BlogPost[]) => {
    if (selectedTag === 'all') return posts;
    return posts.filter(post => post.tags?.includes(selectedTag));
  };

  const filteredFeatured = selectedTag === 'all'
    ? featuredPost
    : featuredPost && featuredPost.tags?.includes(selectedTag) ? featuredPost : null;
  const filteredRegular = getFilteredPosts(regularPosts);

  const handlePostClick = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  return (
    <Layout pageTheme="blog">
      {/* HERO */}
      <section className="relative px-5 sm:px-8 pt-12 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] max-w-[140vw] z-0 blur-[8px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(192,200,224,0.10), transparent 60%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1100px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="mb-6 font-mono text-[11px] tracking-[0.18em] uppercase text-aurora-platinum">
              &#9656; BLOG &middot; BUILD LOG &middot; TRANSPARENCY
            </div>

            <h1
              className="font-sans font-bold text-aurora-text mb-6 tracking-[-0.035em] leading-[1.04]"
              style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)' }}
            >
              The{' '}
              <span className="font-italic italic font-normal text-aurora-platinum">
                build log
              </span>
              .
            </h1>

            <p className="max-w-[640px] font-sans text-[16px] sm:text-[19px] leading-[1.6] text-aurora-text-mid">
              ComfyUI experiments, AI research, and the day-to-day of shipping ViSuReNa. We write
              what we ran, what worked, and what didn&rsquo;t &mdash; with receipts.
            </p>

            {allTags.length > 1 && (
              <div className="mt-10 flex flex-wrap gap-2.5">
                {allTags.map((tag) => {
                  const active = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`font-sans font-normal text-[13px] px-4 py-2 rounded-full border transition-[color,border-color,background] duration-200 ${
                        active
                          ? 'bg-aurora-platinum text-aurora-bg border-aurora-platinum font-medium'
                          : 'bg-aurora-surface text-aurora-text-mid border-aurora-hairline hover:text-aurora-text hover:border-aurora-platinum hover:bg-aurora-raised'
                      }`}
                    >
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* POSTS */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="mx-auto max-w-[1100px]">
          {filteredFeatured && (
            <div className="mb-14">
              <BlogCard
                key={filteredFeatured.slug}
                title={filteredFeatured.title}
                description={filteredFeatured.description}
                thumbnail={filteredFeatured.thumbnail}
                date={filteredFeatured.releaseDate}
                duration={filteredFeatured.duration}
                tags={filteredFeatured.tags}
                onClick={() => handlePostClick(filteredFeatured.slug)}
                featured={true}
              />
            </div>
          )}

          {filteredRegular.length > 0 ? (
            <div>
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
            </div>
          ) : (
            selectedTag !== 'all' && !filteredFeatured && (
              <div className="text-center py-20">
                <p className="font-sans text-aurora-text-mid text-[17px]">
                  No posts found with the tag &ldquo;{selectedTag}&rdquo;.
                </p>
                <button
                  onClick={() => setSelectedTag('all')}
                  className="mt-4 font-sans text-[14px] text-aurora-platinum hover:text-aurora-text transition-colors"
                >
                  View all posts &rarr;
                </button>
              </div>
            )
          )}

          {blogPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="font-sans text-aurora-text-mid text-[17px] mb-3">No blog posts yet.</p>
              <p className="font-sans italic text-aurora-text-muted text-[14px]">
                Check back soon &mdash; ComfyUI experiments and AI research dropping regularly.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
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
