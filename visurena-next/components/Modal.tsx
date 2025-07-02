import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  videoUrl?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, videoUrl }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-5xl mx-4"
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              {title && (
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>
              )}

              <div className="relative">
                {videoUrl ? (
                  <div className="aspect-w-16 aspect-h-9" style={{ paddingBottom: '56.25%' }}>
                    <ReactPlayer
                      url={videoUrl}
                      width="100%"
                      height="100%"
                      controls
                      playing
                      className="absolute top-0 left-0"
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    {children}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;