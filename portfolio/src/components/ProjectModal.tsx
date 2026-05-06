import React, { useEffect, useRef } from 'react';
import { Project } from '../data/projects'; 
import STLViewer from './STLViewer';

interface ProjectModalProps {
  project: Project;
  isActive: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isActive, onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLElement>(null); // Ref for the close button
  const previouslyFocusedElement = useRef<HTMLElement | null>(null); // To store element focused before modal open

  // Effect for body scroll lock, Escape key, and focus management
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isActive) {
      // Store the element that was focused before opening the modal
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      document.body.classList.add('body-modal-open');
      window.addEventListener('keydown', handleEsc);
      
      // Focus the close button (or another focusable element) when modal opens
      // Timeout helps ensure the element is visible and focusable in the DOM
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0); 
      
      return () => {
        clearTimeout(timer);
        document.body.classList.remove('body-modal-open');
        window.removeEventListener('keydown', handleEsc);
        // Restore focus to the previously focused element when modal closes
        previouslyFocusedElement.current?.focus();
      };
    } else {
      // Ensure cleanup if isActive becomes false without unmounting/remounting
      document.body.classList.remove('body-modal-open');
      window.removeEventListener('keydown', handleEsc);
       // Restore focus if modal becomes inactive not due to unmount
      if (document.body.classList.contains('body-modal-open')) { // Check if class was actually added
         previouslyFocusedElement.current?.focus();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [isActive, onClose]); // onClose in deps to re-run if it changes (though unlikely for this prop)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // We always render the modal structure and use CSS to show/hide for transitions.
  // if (!isActive) {
  //   return null; 
  // }

  return (
    <div
      className={`portfolio__modal ${isActive ? 'active' : ''}`}
      id={`modal-${project.id}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${project.id}`}
      aria-hidden={!isActive} // Helps hide from AT when not active
    >
      <div className="portfolio__modal-content" ref={modalContentRef}>
        <i 
          className="ri-close-line portfolio__modal-close" 
          onClick={onClose} 
          aria-label="Close modal"
          ref={closeButtonRef} // Assign ref
          tabIndex={0} // Make it focusable
          role="button" // Explicitly define role for non-button element
          onKeyDown={(e: React.KeyboardEvent) => { 
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault(); // Prevent space from scrolling
              onClose(); 
            }
          }}
        ></i>
        <h3 className="portfolio__modal-title" id={`modal-title-${project.id}`}>{project.title}</h3>
        {project.stlUrl && isActive ? (
          <STLViewer url={project.stlUrl} />
        ) : (
          <img src={project.image} alt={project.title} className="portfolio__modal-img" />
        )}
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