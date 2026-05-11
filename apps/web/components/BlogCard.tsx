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
        className="cursor-pointer group rounded-xl overflow-hidden bg-aurora-surface border border-aurora-hairline transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-aurora-platinum hover:shadow-[0_24px_60px_-18px_rgba(192,200,224,0.30)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {thumbnail && (
          <div className="overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}

        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <div className="mb-3 font-mono text-[10px] tracking-[0.18em] uppercase text-aurora-platinum">
            // FEATURED &middot; BUILD LOG
          </div>

          <h2 className="mb-5 font-sans font-bold text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-aurora-text group-hover:text-white transition-colors">
            {title}
          </h2>

          <p className="mb-7 font-sans italic text-[16px] sm:text-[18px] text-aurora-text-mid leading-[1.6] max-w-[640px]">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.08em] text-aurora-text-muted">
            <span className="text-aurora-text-mid font-medium">VISURENA</span>
            <span>&middot;</span>
            <time>{formattedDate}</time>
            {duration && (
              <>
                <span>&middot;</span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {duration}
                </span>
              </>
            )}
          </div>

          {tags && tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-sans font-normal text-[12px] px-3 py-1 rounded-full bg-aurora-raised text-aurora-text-mid border border-aurora-hairline group-hover:border-aurora-platinum group-hover:text-aurora-text transition-colors"
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
      className="cursor-pointer group border-b border-aurora-hairline py-7 transition-[border-color] duration-300 hover:border-aurora-platinum"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <h3 className="mb-2 font-sans font-semibold text-[19px] sm:text-[21px] leading-[1.25] tracking-[-0.01em] text-aurora-text group-hover:text-aurora-platinum transition-colors">
            {title}
          </h3>

          <p className="mb-3 font-sans text-[14px] sm:text-[15px] text-aurora-text-mid leading-[1.55] line-clamp-2">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-aurora-text-muted">
            <time>{formattedDate}</time>
            {duration && (
              <>
                <span>&middot;</span>
                <span>{duration}</span>
              </>
            )}
            {tags && tags.length > 0 && (
              <>
                <span>&middot;</span>
                <span className="text-aurora-platinum uppercase tracking-[0.12em]">{tags[0]}</span>
              </>
            )}
          </div>
        </div>

        {thumbnail && (
          <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 overflow-hidden rounded-md bg-aurora-raised">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default BlogCard;
