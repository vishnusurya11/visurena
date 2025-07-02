import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  pageTheme?: 'home' | 'movies' | 'music' | 'games' | 'story' | 'blog';
}

const Layout: React.FC<LayoutProps> = ({ children, pageTheme = 'home' }) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', theme: 'home' },
    { name: 'Movies', path: '/movies', theme: 'movies' },
    { name: 'Music', path: '/music', theme: 'music' },
    { name: 'Games', path: '/games', theme: 'games' },
    { name: 'Story', path: '/story', theme: 'story' },
    { name: 'Blog', path: '/blog', theme: 'blog' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getThemeColors = () => {
    return 'bg-netflix-black text-netflix-text';
  };

  const getAccentColor = () => {
    const colors = {
      movies: 'text-theme-movies-primary',
      music: 'text-theme-music-primary',
      games: 'text-theme-games-primary',
      story: 'text-theme-story-primary',
      blog: 'text-theme-blog-primary',
      home: 'text-netflix-text',
    };
    return colors[pageTheme] || colors.home;
  };

  return (
    <div className={`min-h-screen ${getThemeColors()} transition-colors duration-500`}>
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-netflix-dark' : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <motion.h1 
                  className={`text-3xl font-bold cursor-pointer ${getAccentColor()}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ViSuReNa
                </motion.h1>
              </Link>
              
              <ul className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <motion.span
                        className={`cursor-pointer text-sm font-medium transition-colors duration-200 ${
                          router.pathname === item.path
                            ? getAccentColor()
                            : 'text-netflix-gray hover:text-netflix-text'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                className="text-netflix-gray hover:text-netflix-text p-2 transition-colors duration-200"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isSearchOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <MagnifyingGlassIcon className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSearch}
                className="mt-4"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, people, genres"
                  className="w-full px-4 py-3 bg-netflix-dark text-netflix-text border border-netflix-gray/30 focus:outline-none focus:border-netflix-text transition-colors placeholder-netflix-gray"
                  autoFocus
                />
              </motion.form>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <main className="pt-20">
        {children}
      </main>

      <footer className="bg-black/80 text-gray-400 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${getAccentColor()}`}>ViSuReNa</h3>
              <p className="text-sm">Your gateway to visual, auditory, and narrative experiences.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <span className="hover:text-white cursor-pointer">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer">Featured</li>
                <li className="hover:text-white cursor-pointer">New Releases</li>
                <li className="hover:text-white cursor-pointer">Popular</li>
                <li className="hover:text-white cursor-pointer">Coming Soon</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <p className="text-sm">Stay updated with our latest releases and updates.</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 ViSuReNa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;