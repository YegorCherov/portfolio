import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    triggerAerospaceAnimation: () => void;
    startF35Intercept: (visualUavElement: HTMLDivElement, clickedButton: HTMLDivElement) => void;
    isIntercepting?: boolean;
  }
}

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const uavVisualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (window.triggerAerospaceAnimation) {
            window.triggerAerospaceAnimation();
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const handleUAVButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const uavElement = event.currentTarget.parentElement as HTMLDivElement;
    const buttonElement = event.currentTarget as HTMLDivElement;

    // Remove the click-me indicator on the static element
    if (uavElement) {
      const clickMeLabel = uavElement.querySelector('.uav-click-me');
      if (clickMeLabel) {
        clickMeLabel.remove();
      }
    }

    if (uavElement && buttonElement && window.startF35Intercept) {
      window.startF35Intercept(uavElement, buttonElement);
    } else {
      console.error('F35 intercept function or UAV parent/button elements not ready.');
      if (!uavElement) console.error('uavElement (parent) is null or undefined');
      if (!buttonElement) console.error('buttonElement (clicked target) is null or undefined');
      if (!window.startF35Intercept) console.error('window.startF35Intercept is not defined');
    }
  };

  return (
    <section className="hero section" id="home" ref={heroRef}>
      <span className="section-id">SEC-001: HERO</span>

      <div className="uav" ref={uavVisualRef}>
        {/* Flashing click-me target for static fallback */}
        <div className="uav-click-me">CLICK ME</div>
        
        <div
          className="uav-child-button"
          onClick={handleUAVButtonClick}
          onMouseEnter={() => {
            console.log('UAV Child Button MouseEnter - Adding class');
            const cursor = document.querySelector('.cursor');
            const follower = document.querySelector('.cursor-follower');
            if (cursor) cursor.classList.add('uav-target-hover');
            if (follower) follower.classList.add('uav-target-hover');
          }}
          onMouseLeave={() => {
            console.log('UAV Child Button MouseLeave - Removing class');
            const cursor = document.querySelector('.cursor');
            const follower = document.querySelector('.cursor-follower');
            if (cursor) cursor.classList.remove('uav-target-hover');
            if (follower) follower.classList.remove('uav-target-hover');
          }}
        >
        </div>
      </div>

      <div className="f35"></div>
      <div className="missile"></div>
      <div className="explosion"></div>

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