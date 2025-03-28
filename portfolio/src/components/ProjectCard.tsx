import React from 'react';
import { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent opening modal when clicking on links inside portfolio item
    if ((e.target as HTMLElement).closest('.portfolio__btn')) {
      return;
    }
    onClick(project.id);
  };

  return (
    <div 
      className="portfolio__item" 
      data-category={project.category} 
      data-modal={`modal-${project.id}`}
      onClick={handleClick}
    >
      <img src={project.image} alt={project.title} className="portfolio__img" />
      <div className="portfolio__overlay">
        <h3 className="portfolio__title">{project.title}</h3>
        <p className="portfolio__category">{project.categoryLabel}</p>
        <div className="portfolio__btns">
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="portfolio__btn"
          >
            <i className="ri-github-line"></i>
          </a>
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="portfolio__btn"
            >
              <i className="ri-eye-line"></i>
            </a>
          )}
          {!project.demoUrl && (
            <a href="#" className="portfolio__btn">
              <i className="ri-eye-line"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
