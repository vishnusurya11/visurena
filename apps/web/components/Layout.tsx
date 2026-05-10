import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  pageTheme?: 'home' | 'movies' | 'music' | 'games' | 'story' | 'blog' | 'vr';
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

    // Only access window after component is mounted
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 50);
      }
    };

    // Initial check
    handleScroll();

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

  const getThemeColors = () => 'bg-aurora-bg text-aurora-text';

  const getAccentColor = () => {
    const colors = {
      movies: 'text-theme-movies-primary',
      music:  'text-theme-music-primary',
      games:  'text-theme-games-primary',
      story:  'text-theme-story-primary',
      blog:   'text-theme-blog-primary',
      vr:     'text-theme-vr-primary',
      home:   'text-aurora-accent',
    };
    return colors[pageTheme] || colors.home;
  };

  const roomMap: Record<NonNullable<LayoutProps['pageTheme']>, string> = {
    home: 'home',
    movies: 'movies',
    music: 'music',
    games: 'games',
    story: 'story',
    blog: 'blog',
    vr: 'vrworld',
  };
  const dataRoom = roomMap[pageTheme];

  return (
    <div
      data-room={dataRoom}
      className={`min-h-screen ${getThemeColors()} transition-colors duration-500`}
    >
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-aurora-bg/80 backdrop-blur-xl border-b border-aurora-hairline'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <motion.h1
                  className={`text-3xl font-bold tracking-tight cursor-pointer ${getAccentColor()}`}
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
                        className={`cursor-pointer text-sm font-medium transition-colors duration-200 pb-1 border-b-[1.5px] ${
                          router.pathname === item.path
                            ? `${getAccentColor()} border-current`
                            : 'text-aurora-text-mid hover:text-aurora-text border-transparent hover:border-aurora-text/40'
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
                className="text-aurora-text-mid hover:text-aurora-text p-2 transition-colors duration-200"
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
                className="md:hidden text-aurora-text-mid hover:text-aurora-text p-2 transition-colors duration-200"
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
                  className="w-full px-4 py-3 rounded-lg bg-aurora-surface text-aurora-text border border-aurora-hairline focus:outline-none focus:border-aurora-accent transition-colors placeholder-aurora-text-muted"
                  autoFocus
                />
              </motion.form>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMounted && isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden mt-4 bg-aurora-surface/95 backdrop-blur-sm rounded-lg p-4 border border-aurora-hairline"
              >
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path}>
                        <motion.span
                          className={`block cursor-pointer text-lg font-medium transition-colors duration-200 ${
                            router.pathname === item.path
                              ? getAccentColor()
                              : 'text-aurora-text-mid hover:text-aurora-text'
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

      <footer className="bg-aurora-bg text-aurora-text-mid border-t border-aurora-hairline pt-16 pb-10 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Left — wordmark + tagline */}
            <div className="md:col-span-4">
              <Link href="/">
                <h3 className="text-2xl font-bold tracking-tight text-aurora-text cursor-pointer">
                  VISURENA
                </h3>
              </Link>
              <p className="mt-3 font-italic italic text-aurora-text-mid text-base leading-relaxed">
                An editorial AI streaming studio.
              </p>
            </div>

            {/* Center — link columns */}
            <div className="md:col-span-6 grid grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase text-aurora-text mb-4">
                  Catalog
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/movies">
                      <span className="hover:text-aurora-text cursor-pointer transition-colors">Movies</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/music">
                      <span className="hover:text-aurora-text cursor-pointer transition-colors">Music</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/games">
                      <span className="hover:text-aurora-text cursor-pointer transition-colors">Games</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/story">
                      <span className="hover:text-aurora-text cursor-pointer transition-colors">Story</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/vr-world">
                      <span className="hover:text-aurora-text cursor-pointer transition-colors">VR World</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase text-aurora-text mb-4">
                  About
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="hover:text-aurora-text cursor-pointer transition-colors">BRD</li>
                  <li className="hover:text-aurora-text cursor-pointer transition-colors">Architecture</li>
                  <li className="hover:text-aurora-text cursor-pointer transition-colors">Phases</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase text-aurora-text mb-4">
                  Connect
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="hover:text-aurora-text cursor-pointer transition-colors">Membership</li>
                  <li className="hover:text-aurora-text cursor-pointer transition-colors">Newsletter</li>
                  <li>
                    <a
                      href="https://github.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-aurora-text cursor-pointer transition-colors"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right — accent membership note */}
            <div className="md:col-span-2 flex md:justify-end">
              <a
                href="#membership"
                className="text-sm text-aurora-accent hover:text-aurora-text transition-colors leading-snug"
              >
                Membership opens at end of Phase 3 &rarr;
              </a>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-12 pt-6 border-t border-aurora-hairline flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <p className="text-aurora-text-muted">
              &copy; 2026 VISURENA. All rights reserved.
            </p>
            <p className="font-mono text-aurora-text-muted">
              // VISURENA &middot; v0.1 &middot; phase 0 &middot; 2026
            </p>
            <p className="font-italic italic text-aurora-text-mid">
              Crowd-steered. Editorially directed. AI-produced.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
