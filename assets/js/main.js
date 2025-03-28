/*
 * Main JavaScript file for Yegor Cherov's Portfolio
 * Features:
 * - Particle background
 * - Custom cursor
 * - Scroll animations
 * - Theme toggle
 * - Portfolio filtering
 * - Terminal text animation
 * - Mobile menu toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initParticles();
  initCustomCursor();
  initScrollAnimations();
  initThemeToggle();
  initMobileMenu();
  initPortfolioFilter();
  initPortfolioModal();
  initTerminalAnimation();
  initSkillsAnimation();
  initScrollToTop();
});

// ===== PARTICLES BACKGROUND =====
function initParticles() {
  const particlesContainer = document.getElementById('particles-js');
  if (!particlesContainer) return;

  particlesJS('particles-js', {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: '#32a8a8'
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#000000'
        },
        polygon: {
          nb_sides: 5
        }
      },
      opacity: {
        value: 0.5,
        random: false,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#32a8a8',
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'grab'
        },
        onclick: {
          enable: true,
          mode: 'push'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 1
          }
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        push: {
          particles_nb: 4
        },
        remove: {
          particles_nb: 2
        }
      }
    },
    retina_detect: true
  });
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if (!cursor || !cursorFollower) return;
  
  // Set initial state
  cursor.classList.add('active');
  cursorFollower.classList.add('active');
  
  // Update cursor position
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Add a slight delay to follower for smooth effect
    setTimeout(() => {
      cursorFollower.style.left = e.clientX + 'px';
      cursorFollower.style.top = e.clientY + 'px';
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
  
  // Hide cursor when leaving window
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      cursor.style.opacity = '0';
      cursorFollower.style.opacity = '0';
    }
  });
  
  document.addEventListener('mouseover', () => {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
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
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    
    if (theme === 'dark') {
      icon.className = 'ri-sun-line';
    } else {
      icon.className = 'ri-moon-line';
    }
  }
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const navToggle = document.querySelector('.nav__toggle');
  const navClose = document.querySelector('.nav__close');
  const navMenu = document.querySelector('.nav__menu');
  const navLinks = document.querySelectorAll('.nav__link');
  
  if (!navToggle || !navClose || !navMenu) return;
  
  // Open menu
  navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu');
  });
  
  // Close menu
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
  });
  
  // Close menu when clicking a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
    });
  });
}

// ===== PORTFOLIO FILTER =====
function initPortfolioFilter() {
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
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
          
          // Add a slight delay for a staggered animation effect
          setTimeout(() => {
            item.classList.add('visible');
          }, 100);
        } else {
          item.classList.remove('visible');
          item.style.display = 'none';
        }
      });
    });
  });
}

// ===== PORTFOLIO MODAL =====
function initPortfolioModal() {
  const portfolioItems = document.querySelectorAll('.portfolio__item');
  const modals = document.querySelectorAll('.portfolio__modal');
  
  if (!portfolioItems.length || !modals.length) return;
  
  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const modalId = item.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      
      if (modal) {
        modal.classList.add('active');
        
        // Close modal when clicking the close button
        const closeBtn = modal.querySelector('.portfolio__modal-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
          });
        }
        
        // Close modal when clicking outside the content
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      }
    });
  });
}

// ===== TERMINAL ANIMATION =====
function initTerminalAnimation() {
  const terminals = document.querySelectorAll('.terminal');
  
  if (!terminals.length) return;
  
  terminals.forEach(terminal => {
    const lines = terminal.querySelectorAll('.terminal__line');
    
    lines.forEach((line, index) => {
      const text = line.querySelector('.terminal__text');
      if (!text) return;
      
      // Reset animation
      text.style.animation = 'none';
      
      // Trigger reflow
      void text.offsetWidth;
      
      // Start animation with delay based on line index
      text.style.animation = `typing 3.5s steps(40, end) ${index * 2}s forwards, blink-caret 0.75s step-end infinite`;
    });
  });
}

// ===== SKILLS ANIMATION =====
function initSkillsAnimation() {
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
        const progressBar = entry.target.querySelector('.skill__progress');
        const progressValue = progressBar.getAttribute('data-progress');
        
        progressBar.style.width = progressValue;
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  skills.forEach(skill => {
    observer.observe(skill);
  });
}

// ===== SCROLL TO TOP =====
function initScrollToTop() {
  const scrollBtn = document.querySelector('.scrollup');
  
  if (!scrollBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY >= 560) {
      scrollBtn.classList.add('show-scroll');
    } else {
      scrollBtn.classList.remove('show-scroll');
    }
  });
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
