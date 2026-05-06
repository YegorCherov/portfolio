import React, { useEffect } from 'react';
import { initCustomCursor, initScrollAnimations, initScrollToTop } from '../utils/loadScripts';

// Import sections
import Hero from '../components/sections/Hero';
import Portfolio from '../components/sections/Portfolio';
import Contact from '../components/sections/Contact';

const Home: React.FC = () => {
  useEffect(() => {
    // Initialize global scripts
    initCustomCursor();
    initScrollAnimations();
    initScrollToTop();
  }, []);

  return (
    <main className="main">
      <Hero />
      <Portfolio />
      <Contact />
    </main>
  );
};

export default Home;
