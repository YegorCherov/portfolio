export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
}

const services: Service[] = [
  {
    id: 'game-dev',
    title: 'Game Development',
    description: 'Creating immersive and engaging game experiences using Unity and C#. From concept to deployment, I handle all aspects of game development including mechanics, controls, and optimization.',
    icon: 'ri-gamepad-line',
    link: '#portfolio'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Experienced in threat detection, forensic investigations, and SOC workflow optimization. Expertise in QRadar rule development, API integrations, and security log analysis.',
    icon: 'ri-shield-keyhole-line',
    link: '#portfolio'
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Building intelligent systems and models for computer vision, data analysis, and automation. Creating AI-powered tools that solve real-world problems efficiently.',
    icon: 'ri-robot-line',
    link: '#portfolio'
  },
  {
    id: 'fullstack',
    title: 'web develoment',
    description: 'Developing end-to-end web applications with modern technologies. From responsive frontends to robust backends, I create complete digital solutions.',
    icon: 'ri-code-s-slash-line',
    link: '#portfolio'
  }
];

export default services;
