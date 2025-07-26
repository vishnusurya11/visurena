import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

interface LayoutProps {
  children: React.ReactNode;
  pageTheme?: 'home' | 'movies' | 'music' | 'games' | 'story' | 'blog' | 'wiki' | 'vr';
}

const Layout: React.FC<LayoutProps> = ({ children, pageTheme = 'home' }) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    { name: 'VR World', path: '/vr-world', theme: 'vr' },
    { name: 'Wiki', path: '/wiki', theme: 'wiki' },
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
      wiki: 'text-theme-wiki-primary',
      vr: 'text-theme-vr-primary',
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
                  className={`text-3xl font-bold cursor-pointer ${getAccentColor()} ${orbitron.className}`}
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
              
              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden text-netflix-gray hover:text-netflix-text p-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
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

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden mt-4 bg-netflix-dark/95 backdrop-blur-sm rounded-lg p-4"
              >
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path}>
                        <motion.span
                          className={`block cursor-pointer text-lg font-medium transition-colors duration-200 ${
                            router.pathname === item.path
                              ? getAccentColor()
                              : 'text-netflix-gray hover:text-netflix-text'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.name}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
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
              <h3 className={`text-lg font-semibold mb-4 ${getAccentColor()} ${orbitron.className}`}>ViSuReNa</h3>
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
              <h4 className="text-lg font-semibold mb-4">Research & Analysis</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog">
                    <span className="hover:text-white cursor-pointer">Blog</span>
                  </Link>
                </li>
                <li>
                  <Link href="/wiki">
                    <span className="hover:text-white cursor-pointer">Wiki Analysis</span>
                  </Link>
                </li>
                <li className="hover:text-white cursor-pointer">Movie Research</li>
                <li className="hover:text-white cursor-pointer">Music Analysis</li>
                <li className="hover:text-white cursor-pointer">Game Studies</li>
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