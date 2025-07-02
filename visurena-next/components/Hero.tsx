import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';

interface HeroContent {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnail: string;
  type: 'movie' | 'music' | 'game' | 'story';
}

interface HeroProps {
  featuredContent: HeroContent[];
  onPlay: (content: HeroContent) => void;
  onMoreInfo: (content: HeroContent) => void;
}

const Hero: React.FC<HeroProps> = ({ featuredContent, onPlay, onMoreInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (featuredContent.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }, 10000); // Change every 10 seconds
      return () => clearInterval(interval);
    }
  }, [featuredContent.length]);

  if (featuredContent.length === 0) return null;

  const current = featuredContent[currentIndex];

  return (
    <div className="relative h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {current.videoUrl && (
            <div className="absolute inset-0 z-0">
              <ReactPlayer
                url={current.videoUrl}
                playing
                muted
                loop
                width="100%"
                height="100%"
                className="absolute inset-0"
                style={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  minWidth: '100%',
                  minHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                }}
                onReady={() => setIsVideoLoaded(true)}
              />
            </div>
          )}
          
          {(!current.videoUrl || !isVideoLoaded) && (
            <img
              src={current.thumbnail}
              alt={current.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-4 text-white"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {current.title}
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {current.description}
              </motion.p>

              <motion.div 
                className="flex space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => onPlay(current)}
                  className="flex items-center space-x-2 px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <PlayIcon className="h-6 w-6" />
                  <span>Play</span>
                </button>
                
                <button
                  onClick={() => onMoreInfo(current)}
                  className="flex items-center space-x-2 px-8 py-3 bg-gray-500/50 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-gray-500/70 transition-colors"
                >
                  <InformationCircleIcon className="h-6 w-6" />
                  <span>More Info</span>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {featuredContent.length > 1 && (
        <div className="absolute bottom-8 right-8 flex space-x-2">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;