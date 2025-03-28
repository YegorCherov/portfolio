import React, { useEffect } from 'react';
import { initCustomCursor, initScrollAnimations, initScrollToTop } from '../utils/loadScripts';

// Import sections
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
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
      <About />
      <Services />
      <Portfolio />
      <Contact />
    </main>
  );
};

export default Home;
