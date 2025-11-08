import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

interface BlogCardProps {
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  duration?: string;
  tags?: string[];
  onClick: () => void;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  description,
  thumbnail,
  date,
  duration,
  tags,
  onClick,
  featured = false,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (featured) {
    return (
      <motion.article
        onClick={onClick}
        className="cursor-pointer border-b border-comfy-border pb-12 mb-12 hover:opacity-80 transition-opacity"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Featured Image */}
        <div className="mb-6">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-auto max-h-96 object-cover rounded-xl shadow-2xl"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div>
          <h2 className="font-spectral text-4xl font-bold text-comfy-heading mb-4 leading-tight hover:text-comfy-accent transition-colors">
            {title}
          </h2>

          <p className="text-lg text-comfy-text mb-6 leading-relaxed">
            {description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-comfy-muted">
            <time>{formattedDate}</time>
            {duration && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
              </>
            )}
            {tags && tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      onClick={onClick}
      className="cursor-pointer flex flex-col sm:flex-row gap-6 border-b border-comfy-border py-8 hover:bg-comfy-card/30 transition-colors px-4 -mx-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
    >
      {/* Image */}
      <div className="sm:w-1/3 flex-shrink-0">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-48 sm:h-40 object-cover rounded-lg shadow-lg"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="font-spectral text-2xl font-bold text-comfy-heading mb-2 leading-tight hover:text-comfy-accent transition-colors">
          {title}
        </h2>

        <p className="text-comfy-text mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-comfy-muted">
          <time>{formattedDate}</time>
          {duration && (
            <>
              <span>·</span>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            </>
          )}
          {tags && tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag, index) => (
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
      </div>
    </motion.article>
  );
};

export default BlogCard;
