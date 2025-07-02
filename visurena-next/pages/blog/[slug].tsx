import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getAllPosts, getPostBySlug } from '../../lib/blog';
import { marked } from 'marked';
import { motion } from 'framer-motion';

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

export default function BlogPost({ post }: BlogPostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout pageTheme="blog">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout pageTheme="blog">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-netflix-text">Post not found</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTheme="blog">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-netflix-card rounded-lg p-8"
        >
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-theme-blog-primary mb-4">
              {post.title}
            </h1>
            
            {post.introduction && (
              <p className="text-xl text-netflix-muted mb-6 leading-relaxed">
                {post.introduction}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-netflix-gray border-b border-netflix-gray/20 pb-4">
              <div className="flex items-center space-x-4">
                <span>By {post.author || 'ViSuReNa'}</span>
                <span>•</span>
                <time>{new Date(post.date).toLocaleDateString()}</time>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex space-x-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-theme-blog-muted text-netflix-text rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {post.image && post.image !== '/images/blog-default.jpg' && (
            <div className="mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full max-w-3xl mx-auto h-auto object-cover rounded-lg shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

          {/* Content */}
          <div className="blog-content">
            {post.isHtml ? (
              <div 
                className="html-content text-netflix-muted leading-relaxed"
                style={{
                  color: '#b3b3b3',
                  fontSize: '1.1rem',
                  lineHeight: '1.7'
                }}
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            ) : (
              <div 
                className="prose prose-invert prose-lg max-w-none
                           prose-headings:text-netflix-text
                           prose-p:text-netflix-muted prose-p:leading-relaxed
                           prose-a:text-theme-blog-primary prose-a:no-underline hover:prose-a:underline
                           prose-strong:text-netflix-text
                           prose-code:text-theme-blog-secondary prose-code:bg-netflix-dark prose-code:px-1 prose-code:rounded
                           prose-blockquote:border-l-theme-blog-primary prose-blockquote:text-netflix-muted
                           prose-ul:text-netflix-muted prose-ol:text-netflix-muted
                           prose-li:text-netflix-muted"
                dangerouslySetInnerHTML={{ __html: marked(post.content) }}
              />
            )}
          </div>

          <style jsx>{`
            .html-content h1,
            .html-content h2,
            .html-content h3,
            .html-content h4 {
              color: #3b82f6 !important;
              margin-top: 2rem !important;
              margin-bottom: 1rem !important;
              font-weight: 600 !important;
            }
            
            .html-content h2 {
              font-size: 1.8rem !important;
            }
            
            .html-content h3 {
              font-size: 1.4rem !important;
              color: #fbbf24 !important;
            }
            
            .html-content p {
              color: #b3b3b3 !important;
              margin-bottom: 1rem !important;
            }
            
            .html-content strong {
              color: #ffffff !important;
            }
            
            .html-content ul,
            .html-content ol {
              color: #b3b3b3 !important;
              margin: 1rem 0 !important;
              padding-left: 1.5rem !important;
            }
            
            .html-content li {
              margin-bottom: 0.5rem !important;
            }
            
            .html-content hr {
              border-color: #333333 !important;
              margin: 3rem 0 !important;
            }
            
            .html-content img {
              max-width: 100% !important;
              height: auto !important;
              border-radius: 8px !important;
              margin: 2rem 0 !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            }
            
            .html-content a {
              color: #3b82f6 !important;
              text-decoration: none !important;
            }
            
            .html-content a:hover {
              text-decoration: underline !important;
            }
          `}</style>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-netflix-gray/20">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-theme-blog-primary text-white rounded hover:bg-theme-blog-secondary transition-colors"
            >
              ← Back to Blog
            </button>
          </footer>
        </motion.article>
      </div>
    </Layout>
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