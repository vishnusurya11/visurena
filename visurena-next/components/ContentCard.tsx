import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, BookOpenIcon, MusicalNoteIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';
import { ClockIcon, StarIcon } from '@heroicons/react/24/outline';

interface ContentCardProps {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  duration?: string;
  rating?: number;
  tags?: string[];
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  type,
  title,
  description,
  thumbnail,
  duration,
  rating,
  tags,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getTypeIcon = () => {
    switch (type) {
      case 'movie':
        return <PlayIcon className="h-12 w-12" />;
      case 'music':
        return <MusicalNoteIcon className="h-12 w-12" />;
      case 'game':
        return <PuzzlePieceIcon className="h-12 w-12" />;
      case 'story':
      case 'blog':
        return <BookOpenIcon className="h-12 w-12" />;
      default:
        return <PlayIcon className="h-12 w-12" />;
    }
  };

  const getTypeColor = () => {
    const colors = {
      movie: 'from-theme-movies-primary',
      music: 'from-theme-music-primary',
      game: 'from-theme-games-primary',
      story: 'from-theme-story-primary',
      blog: 'from-theme-blog-primary',
    };
    return colors[type] || 'from-gray-600';
  };

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded bg-netflix-card transition-transform duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        {!imageError && thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-48 bg-gradient-to-br ${getTypeColor()} to-gray-900 flex items-center justify-center`}>
            <div className="text-white/50">
              {getTypeIcon()}
            </div>
          </div>
        )}
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white"
            >
              {getTypeIcon()}
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="p-3 bg-netflix-card">
        <h3 className="text-sm font-medium text-netflix-text mb-1 truncate">{title}</h3>
        
        <p className="text-xs text-netflix-gray mb-2 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-xs text-netflix-gray">
          {duration && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          )}
          
          {rating && (
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-netflix-dark text-netflix-gray rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {isHovered && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent"
        >
          <button className="w-full py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
            {type === 'blog' || type === 'story' ? 'Read More' : 'Play Now'}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ContentCard;