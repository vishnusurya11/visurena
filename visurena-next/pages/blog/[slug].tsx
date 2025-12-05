import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { getAllPosts, getPostBySlug } from '../../lib/blog';
import { marked } from 'marked';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const ImageComparisonSlider = dynamic(() => import('../../components/ImageComparisonSlider'), {
  ssr: false
});

interface BlogPostProps {
  post: {
    title: string;
    content: string;
    date: string;
    author: string;
    tags: string[];
    introduction: string;
    image?: string;
    isHtml?: boolean;
  };
}

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function BlogPost({ post }: BlogPostProps) {
  const router = useRouter();

  // Initialize image comparison sliders after content loads
  useEffect(() => {
    const initializeSliders = () => {
      const sliderDivs = document.querySelectorAll('.image-comparison');

      sliderDivs.forEach((div) => {
        // Skip if already initialized
        if (div.querySelector('.react-compare-slider')) return;

        const before = div.getAttribute('data-before');
        const after = div.getAttribute('data-after');
        const beforeLabel = div.getAttribute('data-before-label') || 'Before';
        const afterLabel = div.getAttribute('data-after-label') || 'After';

        if (before && after) {
          // Create a React root and render the slider
          import('react-dom/client').then(({ createRoot }) => {
            const root = createRoot(div);
            import('../../components/ImageComparisonSlider').then(({ default: Slider }) => {
              root.render(
                <Slider
                  beforeImage={before}
                  afterImage={after}
                  beforeLabel={beforeLabel}
                  afterLabel={afterLabel}
                />
              );
            });
          });
        }
      });
    };

    // Run after content is rendered
    const timer = setTimeout(initializeSliders, 100);
    return () => clearTimeout(timer);
  }, [post.content]);

  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-comfy-bg flex items-center justify-center">
        <div className="text-comfy-text">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-comfy-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-comfy-heading mb-4">Post not found</h1>
          <button
            onClick={() => router.push('/blog')}
            className="text-comfy-accent hover:underline"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-comfy-bg">
      {/* Back Button - Fixed at top */}
      <div className="sticky top-0 z-10 bg-comfy-bg/95 backdrop-blur-sm border-b border-comfy-border">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-4xl">
          <button
            onClick={() => router.push('/blog')}
            className="text-comfy-muted hover:text-comfy-accent transition-colors text-sm font-sans flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Blog</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-comfy-heading mb-6 leading-tight font-serif">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-comfy-muted border-b border-comfy-border pb-6 font-sans">
              <span className="font-medium text-comfy-text">{post.author || 'ViSuReNa'}</span>
              <span className="text-comfy-border">·</span>
              <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>

              {post.tags && post.tags.length > 0 && (
                <>
                  <span className="text-comfy-border">·</span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-comfy-card text-comfy-muted rounded text-xs border border-comfy-border hover:border-comfy-accent hover:text-comfy-accent transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {post.image && post.image !== '/images/blog-default.jpg' && (
            <div className="mb-12">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto object-cover rounded-xl shadow-2xl"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className="comfy-blog-content">
            {post.isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: marked(post.content) }} />
            )}
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-comfy-border">
            <div className="flex items-center justify-between font-sans">
              <button
                onClick={() => router.push('/blog')}
                className="text-comfy-accent hover:text-comfy-heading transition-colors flex items-center gap-2"
              >
                <span>←</span>
                <span>More Posts</span>
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-comfy-muted hover:text-comfy-accent transition-colors flex items-center gap-2"
              >
                <span>Back to Top</span>
                <span>↑</span>
              </button>
            </div>
          </footer>
        </motion.article>
      </div>

      {/* Global styles for blog content */}
      <style jsx global>{`
        .comfy-blog-content {
          font-family: Georgia, Cambria, 'Times New Roman', serif;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #e5e5e5;
        }

        /* Headings */
        .comfy-blog-content h1,
        .comfy-blog-content h2,
        .comfy-blog-content h3,
        .comfy-blog-content h4,
        .comfy-blog-content h5,
        .comfy-blog-content h6 {
          font-family: Georgia, Cambria, 'Times New Roman', serif;
          color: #ffffff;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .comfy-blog-content h1 {
          font-size: 2.25rem;
        }

        .comfy-blog-content h2 {
          font-size: 1.875rem;
          margin-top: 3rem;
        }

        .comfy-blog-content h3 {
          font-size: 1.5rem;
        }

        .comfy-blog-content h4 {
          font-size: 1.25rem;
        }

        /* Paragraphs */
        .comfy-blog-content p {
          margin-bottom: 1.5rem;
          color: #e5e5e5;
        }

        /* Links */
        .comfy-blog-content a {
          color: #3b82f6;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }

        .comfy-blog-content a:hover {
          border-bottom-color: #3b82f6;
        }

        /* Strong/Bold */
        .comfy-blog-content strong,
        .comfy-blog-content b {
          color: #ffffff;
          font-weight: 600;
        }

        /* Emphasis/Italic */
        .comfy-blog-content em,
        .comfy-blog-content i {
          font-style: italic;
          color: #f5f5f5;
        }

        /* Lists */
        .comfy-blog-content ul,
        .comfy-blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
          color: #e5e5e5;
        }

        .comfy-blog-content li {
          margin-bottom: 0.75rem;
          line-height: 1.8;
        }

        .comfy-blog-content li::marker {
          color: #3b82f6;
        }

        /* Blockquotes */
        .comfy-blog-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          color: #999999;
          font-style: italic;
        }

        /* Horizontal Rule */
        .comfy-blog-content hr {
          border: none;
          border-top: 1px solid #2a2a2a;
          margin: 3rem 0;
        }

        /* Images - Full-width, responsive, Comfy.org style */
        .comfy-blog-content img {
          width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2.5rem 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: block;
        }

        /* Videos - Full-width, responsive */
        .comfy-blog-content video {
          width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2.5rem 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: block;
        }

        /* Code - Inline */
        .comfy-blog-content code {
          background-color: #1e1e1e;
          color: #3b82f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
        }

        /* Code Blocks */
        .comfy-blog-content pre {
          background-color: #1e1e1e;
          border: 1px solid #2a2a2a;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
          overflow-x: auto;
        }

        .comfy-blog-content pre code {
          background: none;
          color: #e5e5e5;
          padding: 0;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Tables */
        .comfy-blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }

        .comfy-blog-content th,
        .comfy-blog-content td {
          border: 1px solid #2a2a2a;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .comfy-blog-content th {
          background-color: #111111;
          color: #ffffff;
          font-weight: 600;
        }

        .comfy-blog-content td {
          color: #e5e5e5;
        }

        /* Figure/Figcaption - for image captions */
        .comfy-blog-content figure {
          margin: 2.5rem 0;
        }

        .comfy-blog-content figcaption {
          text-align: center;
          font-size: 0.9rem;
          color: #999999;
          margin-top: 0.75rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = getPostBySlug(params?.slug as string);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
};
