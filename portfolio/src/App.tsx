import React, { useEffect } from 'react';
import './css/styles.css';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

// Import scripts
import { 
  loadParticlesScript, 
  initCustomCursor, 
  initScrollAnimations, 
  initScrollToTop,
  initSkillsAnimation,
  initPortfolioFilter
} from './utils/loadScripts';

const App: React.FC = () => {
  useEffect(() => {
    // Load external scripts
    const particlesScript = document.createElement('script');
    particlesScript.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    particlesScript.async = true;
    particlesScript.onload = () => {
      loadParticlesScript();
    };
    document.body.appendChild(particlesScript);

    // Load custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);

    // Initialize all scripts
    setTimeout(() => {
      initCustomCursor();
      initScrollAnimations();
      initScrollToTop();
      initSkillsAnimation();
      initPortfolioFilter();
    }, 500);

    return () => {
      document.body.removeChild(particlesScript);
      if (cursor.parentNode) document.body.removeChild(cursor);
      if (cursorFollower.parentNode) document.body.removeChild(cursorFollower);
    };
  }, []);

  return (
    <>
      <Header />
      <Home />
      <Footer />
      <a href="#" className="scrollup" id="scroll-up">
        <i className="ri-arrow-up-line"></i>
      </a>
    </>
  );
};

export default App;
