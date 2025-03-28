import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Map form field names to state property names
    const stateKey = name === 'user_name' ? 'name' : 
                     name === 'user_email' ? 'email' : name;
    
    setFormData(prev => ({
      ...prev,
      [stateKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      // Get EmailJS credentials from environment variables
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
      
      await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current,
        publicKey
      );
      
      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! I will get back to you soon.'
      });
      
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus({
        success: false,
        message: 'Failed to send message. Please try again or contact me directly via email.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
          
          <form ref={formRef} onSubmit={handleSubmit} className="contact__form">
            <div className="contact__form-div">
              <input 
                type="text" 
                name="user_name"
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
                name="user_email"
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
            
            <button 
              type="submit" 
              className="btn contact__form-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            
            {submitStatus && (
              <div className={`contact__form-status ${submitStatus.success ? 'success' : 'error'}`}>
                {submitStatus.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
