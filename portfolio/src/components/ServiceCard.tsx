import React from 'react';
import { Service } from '../data/services';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="service">
      <i className={`${service.icon} service__icon`}></i>
      <h3 className="service__title">{service.title}</h3>
      <p className="service__desc">
        {service.description}
      </p>
      <a href={service.link} className="link__text">
        View Projects <span>&rarr;</span>
      </a>
    </div>
  );
};

export default ServiceCard;
