
/**
 * Initialize custom cursor
 */
export const initCustomCursor = (): void => {
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if (!cursor || !cursorFollower) return;
  
  // Set initial state
  cursor.classList.add('active');
  cursorFollower.classList.add('active');
  
  // Update cursor position
  document.addEventListener('mousemove', (e) => {
    cursor.setAttribute('style', `left: ${e.clientX}px; top: ${e.clientY}px;`);
    
    // Add a slight delay to follower for smooth effect
    setTimeout(() => {
      cursorFollower.setAttribute('style', `left: ${e.clientX}px; top: ${e.clientY}px;`);
    }, 50);
  });
  
  // Add hover effect to interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .btn, .portfolio__item, .theme-toggle, .nav__toggle, .nav__close');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorFollower.classList.add('hover');
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorFollower.classList.remove('hover');
    });
  });
};

/**
 * Initialize scroll animations
 */
export const initScrollAnimations = (): void => {
  const sections = document.querySelectorAll('section');
  const workBoxes = document.querySelectorAll('.portfolio__item');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe sections
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Observe work boxes
  workBoxes.forEach(box => {
    observer.observe(box);
  });
  
  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
};

/**
 * Initialize scroll to top button
 */
export const initScrollToTop = (): void => {
  const scrollBtn = document.querySelector('.scrollup');
  
  if (!scrollBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY >= 560) {
      scrollBtn.classList.add('show-scroll');
    } else {
      scrollBtn.classList.remove('show-scroll');
    }
  });
  
  scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
};

/**
 * Initialize skills animation
 */
export const initSkillsAnimation = (): void => {
  const skills = document.querySelectorAll('.skill');
  
  if (!skills.length) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBar = entry.target.querySelector('.skill__progress') as HTMLElement;
        if (progressBar) {
          const progressValue = progressBar.getAttribute('data-progress');
          if (progressValue) {
            progressBar.style.width = progressValue;
          }
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  skills.forEach(skill => {
    observer.observe(skill);
  });
};

/**
 * Initialize portfolio filter
 */
export const initPortfolioFilter = (): void => {
  const filterBtns = document.querySelectorAll('.portfolio__filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio__item');
  
  if (!filterBtns.length || !portfolioItems.length) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      // Filter portfolio items
      portfolioItems.forEach(item => {
        const portfolioItem = item as HTMLElement;
        if (filterValue === 'all' || portfolioItem.getAttribute('data-category') === filterValue) {
          portfolioItem.style.display = 'block';
          
          // Add a slight delay for a staggered animation effect
          setTimeout(() => {
            portfolioItem.classList.add('visible');
          }, 100);
        } else {
          portfolioItem.classList.remove('visible');
          portfolioItem.style.display = 'none';
        }
      });
    });
  });
};
