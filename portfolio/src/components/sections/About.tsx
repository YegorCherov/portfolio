import React from 'react';

const About: React.FC = () => {
  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="section-title">
          <h2>About Me</h2>
        </div>
        
        <div className="about__container">
          <div className="about__content" style={{ gridColumn: '1 / -1' }}>
            <h3>Developer & Cybersecurity Specialist</h3>
            <p className="about__text">
              I'm a passionate developer and cybersecurity analyst with expertise in creating innovative solutions across multiple domains. My journey in technology has equipped me with a diverse skill set that allows me to tackle complex problems with creative and efficient solutions.
            </p>
            
            <div className="about__info">
              <div className="about__info-item">
                <h4 className="about__info-title">2+</h4>
                <p className="about__info-desc">Years of Experience</p>
              </div>
              
              <div className="about__info-item">
                <h4 className="about__info-title">20+</h4>
                <p className="about__info-desc">Completed Projects</p>
              </div>
              
              <div className="about__info-item">
                <h4 className="about__info-title">10+</h4>
                <p className="about__info-desc">Technologies</p>
              </div>
            </div>
            
            <div className="about__skills">
              <div className="skill">
                <div className="skill__name">
                  <span>Unity Development</span>
                  <span>90%</span>
                </div>
                <div className="skill__bar">
                  <div className="skill__progress" data-progress="90%"></div>
                </div>
              </div>
              
              <div className="skill">
                <div className="skill__name">
                  <span>Python</span>
                  <span>85%</span>
                </div>
                <div className="skill__bar">
                  <div className="skill__progress" data-progress="85%"></div>
                </div>
              </div>
              
              <div className="skill">
                <div className="skill__name">
                  <span>Cybersecurity</span>
                  <span>80%</span>
                </div>
                <div className="skill__bar">
                  <div className="skill__progress" data-progress="80%"></div>
                </div>
              </div>
              
              <div className="skill">
                <div className="skill__name">
                  <span>Machine Learning</span>
                  <span>75%</span>
                </div>
                <div className="skill__bar">
                  <div className="skill__progress" data-progress="75%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
