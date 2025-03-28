import React, { useState } from 'react';
import ProjectCard from '../ProjectCard';
import ProjectModal from '../ProjectModal';
import projects from '../../data/projects';

const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleProjectClick = (id: string) => {
    setActiveModal(id);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <section className="portfolio section" id="portfolio">
      <div className="container">
        <div className="section-title">
          <h2>My Portfolio</h2>
        </div>
        
        <div className="portfolio__filter">
          <button 
            className={`portfolio__filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
            data-filter="all"
            onClick={() => handleFilterClick('all')}
          >
            All
          </button>
          <button 
            className={`portfolio__filter-btn ${activeFilter === 'game' ? 'active' : ''}`} 
            data-filter="game"
            onClick={() => handleFilterClick('game')}
          >
            Game Dev
          </button>
          <button 
            className={`portfolio__filter-btn ${activeFilter === 'ai' ? 'active' : ''}`} 
            data-filter="ai"
            onClick={() => handleFilterClick('ai')}
          >
            AI/ML
          </button>
          <button 
            className={`portfolio__filter-btn ${activeFilter === 'web' ? 'active' : ''}`} 
            data-filter="web"
            onClick={() => handleFilterClick('web')}
          >
            Web Dev
          </button>
        </div>
        
        <div className="portfolio__container">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={handleProjectClick} 
            />
          ))}
        </div>
      </div>
      
      {/* Portfolio Modals */}
      {projects.map(project => (
        <ProjectModal 
          key={project.id} 
          project={project} 
          isActive={activeModal === project.id}
          onClose={handleCloseModal}
        />
      ))}
    </section>
  );
};

export default Portfolio;
