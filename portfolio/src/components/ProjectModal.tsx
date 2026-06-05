import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../data/projects';
import STLViewer from './STLViewer';

interface ProjectModalProps {
  project: Project;
  isActive: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isActive, onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isActive) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);

      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
        previouslyFocusedElement.current?.focus();
      };
    }
  }, [isActive, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Determine the image source based on active state
  const imageSrc = isActive && project.gifUrl ? project.gifUrl : project.image;

  const modal = (
    <div
      className={`portfolio__modal ${isActive ? 'active' : ''}`}
      id={`modal-${project.id}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${project.id}`}
      aria-hidden={!isActive}
    >
      <div className="portfolio__modal-content" ref={modalContentRef}>
        <i
          className="ri-close-line portfolio__modal-close"
          onClick={onClose}
          aria-label="Close modal"
          ref={closeButtonRef}
          tabIndex={0}
          role="button"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
        ></i>
        <h3 className="portfolio__modal-title" id={`modal-title-${project.id}`}>
          {project.title}
        </h3>
        {project.stlUrl && isActive ? (
          <STLViewer urls={project.stlUrl} />
        ) : (
          <img 
            src={imageSrc} 
            alt={project.title} 
            className="portfolio__modal-img" 
            loading="lazy"
          />
        )}
        <p className="portfolio__modal-desc">{project.description}</p>
        <div className="portfolio__modal-list">
          {project.technologies.map((tech, index) => (
            <div className="portfolio__modal-item" key={index}>
              <i className="ri-checkbox-circle-line portfolio__modal-icon"></i>
              <p>{tech}</p>
            </div>
          ))}
        </div>
        <div className="portfolio__modal-btns">
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn">
            View Source
          </a>
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ProjectModal;