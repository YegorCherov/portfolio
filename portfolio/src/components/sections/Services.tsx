import React from 'react';
import ServiceCard from '../ServiceCard';
import services from '../../data/services';

const Services: React.FC = () => {
  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-title">
          <h2>My Services</h2>
        </div>
        
        <div className="services__container">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
