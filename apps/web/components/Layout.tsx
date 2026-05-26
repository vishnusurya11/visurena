import React from 'react';
import { TopStatusBar, Header, Footer } from '@visurena/ui';

interface LayoutProps {
  children: React.ReactNode;
  pageTheme?: 'home' | 'movies' | 'music' | 'games' | 'story' | 'blog' | 'vr';
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen text-jewel-ivory">
      <TopStatusBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
