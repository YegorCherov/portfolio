import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="hero" id="home">
      <div id="particles-js" className="hero__particles"></div>
      
      <div className="hero__content">
        <h1 className="hero__title">
          I'm <span>Yegor Cherov</span>
        </h1>
        <h2 className="hero__subtitle">Developer & Cybersecurity Analyst</h2>
        <p className="hero__text">
        Cybersecurity Analyst with 2 years of SOC and Detection engineering experience, specializing in SIEM rule development, forensic investigations, and threat intelligence. Strong background in Python automation, log analysis, and investigations. Served in the Air Force Ofek 324 Unit after graduating from Basmach Cyber Course.

        </p>
        <div className="hero__btns">
          <a href="#portfolio" className="btn">View My Work</a>
          <a href="#contact" className="btn btn-outline">Get In Touch</a>
        </div>
      </div>
      
      <div className="hero__scroll">
        <span className="hero__scroll-text">Scroll Down</span>
        <div className="hero__scroll-icon"></div>
      </div>
    </section>
  );
};

export default Hero;
