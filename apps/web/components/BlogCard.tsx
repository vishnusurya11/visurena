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
        className="cursor-pointer border-b border-comfy-border pb-16 mb-12 hover:opacity-90 transition-opacity group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Featured Image */}
        <div className="mb-8 overflow-hidden rounded-lg">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div>
          <h2 className="font-spectral text-5xl font-bold text-comfy-heading mb-5 leading-tight group-hover:text-comfy-accent transition-colors">
            {title}
          </h2>

          <p className="text-xl text-comfy-text mb-8 leading-relaxed max-w-4xl">
            {description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-base text-comfy-muted">
            <span className="font-medium text-comfy-text">ViSuReNa</span>
            <span>·</span>
            <time>{formattedDate}</time>
            {duration && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-comfy-card text-comfy-muted rounded-md text-sm border border-comfy-border hover:border-comfy-accent hover:text-comfy-accent transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      onClick={onClick}
      className="cursor-pointer border-b border-comfy-border pb-6 mb-6 hover:opacity-90 transition-opacity group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex gap-6 items-start">
        {/* Content on LEFT */}
        <div className="flex-1 min-w-0">
          <h2 className="font-spectral text-xl font-bold text-comfy-heading mb-2 leading-tight group-hover:text-comfy-accent transition-colors">
            {title}
          </h2>

          <p className="text-sm text-comfy-text mb-3 leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-comfy-muted">
            <time>{formattedDate}</time>
            {duration && (
              <>
                <span>·</span>
                <span>{duration}</span>
              </>
            )}
            {tags && tags.length > 0 && (
              <>
                <span>·</span>
                <span className="text-comfy-muted">{tags[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Image on RIGHT - Small square */}
        <div className="flex-shrink-0 w-32 h-32 overflow-hidden rounded-md">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
