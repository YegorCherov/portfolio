import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__container">
          <div>
            <h3 className="footer__title">Yegor Cherov</h3>
            <p>
              Developer & Cybersecurity Analyst creating innovative solutions for complex problems.
            </p>
          </div>
          
          <div>
            <h3 className="footer__title">Explore</h3>
            <ul className="footer__list">
              <li><a href="#home" className="footer__link">Home</a></li>
              <li><a href="#about" className="footer__link">About</a></li>
              <li><a href="#services" className="footer__link">Services</a></li>
              <li><a href="#portfolio" className="footer__link">Portfolio</a></li>
              <li><a href="#contact" className="footer__link">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="footer__title">Projects</h3>
            <ul className="footer__list">
              <li><a href="#portfolio" data-filter="game" className="footer__link portfolio-filter-link">Game Development</a></li>
              <li><a href="#portfolio" data-filter="ai" className="footer__link portfolio-filter-link">AI/ML</a></li>
              <li><a href="#portfolio" data-filter="cyber" className="footer__link portfolio-filter-link">Cybersecurity</a></li>
              <li><a href="#portfolio" data-filter="web" className="footer__link portfolio-filter-link">Web Development</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="footer__title">Follow Me</h3>
            <div className="footer__social">
              <a href="https://github.com/YegorCherov" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <i className="ri-github-line"></i>
              </a>
              <a href="https://www.linkedin.com/in/yegor-cherov" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <i className="ri-linkedin-box-line"></i>
              </a>
            </div>
          </div>
        </div>
        
        <p className="footer__copy">
          &copy; {currentYear} Yegor Cherov. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
