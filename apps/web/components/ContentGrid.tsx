import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ContentCard from './ContentCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Content {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  duration?: string;
  rating?: number;
  tags?: string[];
}

interface ContentGridProps {
  title: string;
  items: Content[];
  variant?: 'grid' | 'carousel';
  onItemClick: (item: Content) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  title, 
  items, 
  variant = 'carousel',
  onItemClick 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkArrows);
      return () => currentRef.removeEventListener('scroll', checkArrows);
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (variant === 'grid') {
    return (
      <div ref={ref} className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {items.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <ContentCard {...item} onClick={() => onItemClick(item)} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} className="mb-12 relative group">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeftIcon className="h-8 w-8 text-white" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRightIcon className="h-8 w-8 text-white" />
          </button>
        )}

        <motion.div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="flex-none w-48 sm:w-56 md:w-64"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ContentCard {...item} onClick={() => onItemClick(item)} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ContentGrid;