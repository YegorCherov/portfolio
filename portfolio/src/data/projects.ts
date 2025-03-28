export interface Project {
  id: string;
  title: string;
  category: 'game' | 'ai' | 'cyber' | 'web' | 'fullstack' | 'automation';
  categoryLabel: string;
  image: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
}

const projects: Project[] = [
  // Computer Vision Projects
  {
    id: 'docscanner',
    title: 'Document Scanner',
    category: 'ai',
    categoryLabel: 'Computer Vision',
    image: '/assets/images/docscanner.png',
    description: 'Developed a Document Scanner that detects document edges and creates an optimized scan of the document.',
    technologies: ['Python', 'OpenCV', 'Scikit', 'Computer Vision'],
    githubUrl: 'https://github.com/YegorCherov/document-scanner'
  },
  {
    id: '3dpcbuilder',
    title: '3DPCBuilder',
    category: 'web',
    categoryLabel: 'Web Development',
    image: '/assets/images/3DPCBuilder.png',
    description: 'A website for building and customizing 3D PC configurations. Users can select components, visualize their build, and get compatibility recommendations.',
    technologies: ['React', 'Node.js', 'Three.js', 'WebGL'],
    githubUrl: 'https://github.com/YegorCherov',
    demoUrl: 'https://www.3dpcbuilder.com/'
  },
  // Game Development Projects
  {
    id: 'empire',
    title: 'EmpireToEnd',
    category: 'game',
    categoryLabel: 'Game Development',
    image: '/assets/images/EmpireToEnd.png',
    description: 'A 2D pixelart RTS game based on medieval kingdoms. Features advanced RTS mechanics and controls, unit management, and resource gathering.',
    technologies: ['Unity', 'C#', 'Game Development', 'Pixel Art'],
    githubUrl: 'https://github.com/YegorCherov/EmpireToEnd'
  },
  {
    id: 'multislicer',
    title: 'MultiSpriteSheetSlicer',
    category: 'game',
    categoryLabel: 'Game Development',
    image: '/assets/images/SlicerToolsImage.png',
    description: 'Unity tool that simplifies the process of breaking down sprite sheets into individual sprites. With customizable options and an intuitive interface, you can slice sprite sheets effortlessly.',
    technologies: ['Unity', 'C#', 'Editor', 'Tool'],
    githubUrl: 'https://github.com/YegorCherov/MultiSpriteSheetSlicer'
  },
  {
    id: 'parallax',
    title: 'Infinite Parallax Background',
    category: 'game',
    categoryLabel: 'Game Development',
    image: '/assets/gifs/ParallaxBackground.gif',
    description: 'Developed a script that controls 3 different backgrounds, by defining different speeds and checking the position of the camera/player, creating an infinite parallax background.',
    technologies: ['Unity', 'C#', 'Game Development'],
    githubUrl: 'https://github.com/YegorCherov/EmpireToEnd'
  },
  {
    id: 'units',
    title: 'Basic Units',
    category: 'game',
    categoryLabel: 'Game Development',
    image: '/assets/gifs/Hwacha.gif',
    description: 'Developed basic units like Catapult, Hwacha, Knight, Archer, Builder including their respective mechanics.',
    technologies: ['Unity', 'C#', 'Game Development'],
    githubUrl: 'https://github.com/YegorCherov/EmpireToEnd'
  },
  {
    id: 'mapgen',
    title: 'Map Generator',
    category: 'game',
    categoryLabel: 'Game Development',
    image: '/assets/gifs/Generation.gif',
    description: 'Procedural terrain generation system implemented in Unity using C#. It generates realistic and diverse terrains using noise functions and chunk-based loading, allowing for efficient rendering and exploration of vast landscapes.',
    technologies: ['Unity', 'C#', 'Procedural Generation', 'Perlin Noise'],
    githubUrl: 'https://github.com/YegorCherov/MapGenerator'
  },
  {
    id: 'rts',
    title: 'RTS Mechanics',
    category: 'game',
    categoryLabel: 'Game Development',
    image: '/assets/gifs/RTSMechanics.gif',
    description: 'Developed Basic and Advanced RTS Mechanics and Controls for real-time strategy games.',
    technologies: ['Unity', 'C#', 'Game Development'],
    githubUrl: 'https://github.com/YegorCherov/EmpireToEnd'
  },
  // AI/ML Projects
  {
    id: 'ai-level',
    title: 'AI Level Designer',
    category: 'ai',
    categoryLabel: 'AI/ML',
    image: '/assets/images/ai-level-designer-home.png',
    description: 'An AI-powered tool for automatically generating game levels based on specified parameters and constraints.',
    technologies: ['Python', 'Machine Learning', 'Unity', 'C#'],
    githubUrl: 'https://github.com/YegorCherov/ai-level-designer'
  },
  {
    id: 'watermark',
    title: 'WaterMark Detector',
    category: 'ai',
    categoryLabel: 'AI/ML',
    image: '/assets/gifs/Water-Gif.gif',
    description: 'Developed Advanced Watermark Detector by training a specific model using 10,000+ Images from multiple different Datasets.',
    technologies: ['Python', 'OpenCV', 'Computer Vision', 'Machine Learning'],
    githubUrl: 'https://github.com/YegorCherov/WatermarkDetector'
  },
  {
    id: 'face-tracker',
    title: 'Face Tracker',
    category: 'ai',
    categoryLabel: 'Computer Vision',
    image: '/assets/gifs/FaceTrackerExampleCropped.gif',
    description: 'Real-time face tracking system using computer vision techniques to detect and track facial features.',
    technologies: ['Python', 'OpenCV', 'Computer Vision', 'Machine Learning'],
    githubUrl: 'https://github.com/YegorCherov'
  },
  {
    id: 'blog',
    title: 'Blog Site',
    category: 'web',
    categoryLabel: 'Web Development',
    image: '/assets/images/blogHome.png',
    description: 'A responsive blog website with modern design and features like content management, user authentication, and commenting.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    githubUrl: 'https://github.com/YegorCherov'
  }
];

export default projects;
