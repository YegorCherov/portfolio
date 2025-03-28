import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send the form data to a server
    console.log('Form submitted:', formData);
    alert('Thank you for your message! I will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="section-title">
          <h2>Get In Touch</h2>
        </div>
        
        <div className="contact__container">
          <div className="contact__info">
            <div className="contact__card">
              <i className="ri-mail-line contact__card-icon"></i>
              <div>
                <h3 className="contact__card-title">Email</h3>
                <span className="contact__card-data">Yegorcherov@gmail.com</span>
                <a href="mailto:Yegorcherov@gmail.com" className="contact__card-button">
                  Write me <i className="ri-arrow-right-line"></i>
                </a>
              </div>
            </div>
            
            <div className="contact__card">
              <i className="ri-linkedin-box-line contact__card-icon"></i>
              <div>
                <h3 className="contact__card-title">LinkedIn</h3>
                <span className="contact__card-data">Yegor Cherov</span>
                <a href="https://www.linkedin.com/in/yegor-cherov" target="_blank" rel="noopener noreferrer" className="contact__card-button">
                  Connect <i className="ri-arrow-right-line"></i>
                </a>
              </div>
            </div>
            
            <div className="contact__card">
              <i className="ri-github-line contact__card-icon"></i>
              <div>
                <h3 className="contact__card-title">GitHub</h3>
                <span className="contact__card-data">YegorCherov</span>
                <a href="https://github.com/YegorCherov" target="_blank" rel="noopener noreferrer" className="contact__card-button">
                  View Profile <i className="ri-arrow-right-line"></i>
                </a>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="contact__form">
            <div className="contact__form-div">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="contact__form-input" 
                placeholder="Your Name"
                required
              />
            </div>
            
            <div className="contact__form-div">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="contact__form-input" 
                placeholder="Your Email"
                required
              />
            </div>
            
            <div className="contact__form-div">
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="contact__form-input contact__form-area" 
                placeholder="Your Message"
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn contact__form-button">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
