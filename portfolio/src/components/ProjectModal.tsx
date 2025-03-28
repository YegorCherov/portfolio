import React from 'react';
import { Project } from '../data/projects';

interface ProjectModalProps {
  project: Project;
  isActive: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isActive, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`portfolio__modal ${isActive ? 'active' : ''}`} 
      id={`modal-${project.id}`}
      onClick={handleBackdropClick}
    >
      <div className="portfolio__modal-content">
        <i className="ri-close-line portfolio__modal-close" onClick={onClose}></i>
        <h3 className="portfolio__modal-title">{project.title}</h3>
        <img src={project.image} alt={project.title} className="portfolio__modal-img" />
        <p className="portfolio__modal-desc">
          {project.description}
        </p>
        <div className="portfolio__modal-list">
          {project.technologies.map((tech, index) => (
            <div className="portfolio__modal-item" key={index}>
              <i className="ri-checkbox-circle-line portfolio__modal-icon"></i>
              <p>{tech}</p>
            </div>
          ))}
        </div>
        <div className="portfolio__modal-btns">
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn"
          >
            View Source
          </a>
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-outline"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
