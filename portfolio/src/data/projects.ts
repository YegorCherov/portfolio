export interface Project {
  id: string;
  title: string;
  category: 'game' | 'ai' | 'cyber' | 'web' | 'fullstack' | 'automation' | '3d';
  categoryLabel: string;
  image: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl?: string;
  stlUrl?: string | string[];
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
  },
   {
    id: "fpv-quad-drone-retractable-legs",
    category: "3d",
    categoryLabel: "3D Model",
    title: "FPV quad drone retractable legs",
    image: "/assets/images/models_images/FPV Leg.png",
    stlUrl: ["/assets/models/FPV Leg Holder.stl", "/assets/models/FPV Leg.stl"],
    description: "Retractable landing gear designed for FPV quadcopters to improve portability and landing stability.",
    technologies: ["Fusion 360", "3D Printing", "Mechanical Design"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "hsw-500w-dremel-holder-v2",
    category: "3d",
    categoryLabel: "3D Model",
    title: "HSW 500w Dremel Holder v2",
    image: "/assets/images/models_images/HSW 500w Dremel Holder v2.png",
    stlUrl: "/assets/models/HSW 500w Dremel Holder v2.stl",
    description: "Improved holder for 500W rotary tools, optimized for Honeycomb Storage Wall mounting.",
    technologies: ["Fusion 360", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "hsw-500w-dremel-holder",
    category: "3d",
    categoryLabel: "3D Model",
    title: "HSW 500w Dremel Holder",
    image: "/assets/images/models_images/HSW 500w Dremel Holder.png",
    stlUrl: "/assets/models/HSW 500w Dremel Holder.stl",
    description: "Wall-mounted holder for 500W rotary tool compatible with HSW systems.",
    technologies: ["Fusion 360", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "vent-v5",
    category: "3d",
    categoryLabel: "3D Model",
    title: "vent v5",
    image: "/assets/images/models_images/vent v5.png",
    description: "Parametric vent design optimized for airflow and print efficiency.",
    technologies: ["CAD", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "oral-b-toothbrush-wall-mount",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Oral B toothbrush wall mount",
    image: "/assets/images/models_images/Oral B toothbrush wall mount.png",
    stlUrl: "/assets/models/Oral B toothbrush wall mount.stl",
    description: "Wall-mounted holder for Oral-B toothbrushes for improved hygiene and space saving.",
    technologies: ["Fusion 360", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "washing-machine-door-closer",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Washing machine door closer",
    image: "/assets/images/models_images/Washing machine door closer.png",
    stlUrl: "/assets/models/Washing machine door closer.stl",
    description: "Mechanical solution to assist in closing or stabilizing washing machine doors.",
    technologies: ["Mechanical Design", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "anti-mosquito-window",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Anti mosquito window",
    image: "/assets/images/models_images/Anti mosquito window.png",
    stlUrl: ["/assets/models/Window fist half.stl", "/assets/models/Window second half.stl"],
    description: "Window attachment system designed to reduce mosquito entry while maintaining airflow.",
    technologies: ["CAD", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "tarkov-usec-dogtag",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Tarkov Usec dogtag",
    image: "/assets/images/models_images/Tarkov Usec dogtag.png",
    stlUrl: "/assets/models/USEC DOGTAG v2.stl",
    description: "Replica dogtag inspired by Escape from Tarkov USEC faction.",
    technologies: ["3D Modeling", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "kuugo-m4-front-license-plate-mount",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Kuugo M4 front license plate mount",
    image: "/assets/images/models_images/Kuugo M4 front license plate mount.png",
    stlUrl: ["/assets/models/KuugoM4_Front_PlateMount_Improved- Front part.stl", "/assets/models/KuugoM4_Front_PlateMount_Improved- Back part.stl"],
    description: "Front-mounted license plate holder for Kuugo M4 electric scooter.",
    technologies: ["Fusion 360", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "mark4-v2-10-inch-sma-crsf-mount",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Mark4 V2 10 inch sma crsf mount",
    image: "/assets/images/models_images/Mark4 V2 10 inch sma crsf mount.png",
    stlUrl: "/assets/models/Mark4 V2 10 inch sma crsf mount.stl",
    description: "Antenna mount for Mark4 V2 drone frame supporting SMA and CRSF setups.",
    technologies: ["FPV Design", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "kuugo-m4-electric-scooter-internal-steering-tube",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Kuugo m4 Electric scooter internal steering tube",
    image: "/assets/images/models_images/Kuugo m4 Electric scooter internal steering tube.png",
    stlUrl: "/assets/models/Kuugo m4 Electric scooter internal steering tube.stl",
    description: "Internal steering tube component replacement for Kuugo M4 scooter.",
    technologies: ["Mechanical CAD", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "hsw-honeycomb-dt9205p-multimeter-holder",
    category: "3d",
    categoryLabel: "3D Model",
    title: "HSW Honeycomb dt9205p multimeter holder",
    image: "/assets/images/models_images/HSW Honeycomb dt9205p multimeter holder.png",
    stlUrl: "/assets/models/HSW Honeycomb dt9205p multimeter holder.stl",
    description: "Multimeter holder designed for DT9205P and compatible with HSW system.",
    technologies: ["Fusion 360", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "hsw-honeycomb-drill-battery-holder",
    category: "3d",
    categoryLabel: "3D Model",
    title: "HSW Honeycomb Drill battery holder",
    image: "/assets/images/models_images/HSW Honeycomb Drill battery holder.png",
    stlUrl: "/assets/models/HSW Honeycomb Drill battery holder.stl",
    description: "Battery holder for power drills designed for Honeycomb Storage Wall.",
    technologies: ["CAD", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "10-inch-mark4-v2-aliexpress-fpv-gps-front-mount",
    category: "3d",
    categoryLabel: "3D Model",
    title: "10 inch mark 4 v2 aliexpress fpv gps front mount",
    image: "/assets/images/models_images/10 inch mark 4 v2 aliexpress fpv gps front mount.png",
    stlUrl: "/assets/models/Gps mount fpv 10 inch v2 with Hole for xt60 connector.stl",
    description: "Front-mounted GPS holder for 10-inch Mark4 V2 FPV drone setups.",
    technologies: ["FPV Design", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  },
  {
    id: "desk-lamp-that-slides-under-the-monitor-arm",
    category: "3d",
    categoryLabel: "3D Model",
    title: "Desk lamp that slides under the monitor arm",
    image: "/assets/images/models_images/Desk lamp that slides under the monitor arm.png",
    description: "Compact desk lamp designed to integrate with monitor arms to save space.",
    technologies: ["Product Design", "3D Printing"],
    githubUrl: "https://www.printables.com/@Rozcy_765706/models",
  }
  
];

export default projects;