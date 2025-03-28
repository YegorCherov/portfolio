import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="header" id="header">
      <div className="container">
        <nav className="nav">
          <a href="#" className="nav__logo">
            Yegor<span>Cherov</span>
          </a>

          <div className={`nav__menu ${isMenuOpen ? 'show-menu' : ''}`} id="nav-menu">
            <ul className="nav__menu-list">
              <li className="nav__item">
                <a href="#home" className="nav__link active" onClick={closeMenu}>
                  Home
                </a>
              </li>
              <li className="nav__item">
                <a href="#about" className="nav__link" onClick={closeMenu}>
                  About
                </a>
              </li>
              <li className="nav__item">
                <a href="#services" className="nav__link" onClick={closeMenu}>
                  Services
                </a>
              </li>
              <li className="nav__item">
                <a href="#portfolio" className="nav__link" onClick={closeMenu}>
                  Portfolio
                </a>
              </li>
              <li className="nav__item">
                <a href="#contact" className="nav__link" onClick={closeMenu}>
                  Contact
                </a>
              </li>
            </ul>

            <div className="nav__close" id="nav-close" onClick={closeMenu}>
              <i className="ri-close-line"></i>
            </div>
          </div>

          <div className="nav__actions">
            <div className="theme-toggle" id="theme-toggle" onClick={toggleTheme}>
              <i className={`ri-${isDarkTheme ? 'sun' : 'moon'}-line`}></i>
            </div>

            <div className="nav__toggle" id="nav-toggle" onClick={toggleMenu}>
              <i className="ri-menu-line"></i>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
