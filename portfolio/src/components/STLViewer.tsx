// @ts-nocheck
import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

interface STLViewerProps {
  urls: string | string[]; // Updated to accept string or array
}

// Inner component: Loads a single STL
const Model: React.FC<{ url: string }> = ({ url }) => {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#8a8a8a" roughness={0.4} metalness={0.5} />
    </mesh>
  );
};

const STLViewer: React.FC<STLViewerProps> = ({ urls }) => {
  // Normalize the input: if it's a single string, wrap it in an array
  const urlArray = Array.isArray(urls) ? urls : [urls];

  return (
    <div 
      className="portfolio__modal-img" 
      style={{ height: '300px', backgroundColor: '#111', borderRadius: '0.5rem', overflow: 'hidden' }}
    >
      <Canvas camera={{ position: [0, 0, 50], fov: 50 }}>
        <Suspense 
          fallback={
            <Html center>
              <span style={{ color: 'white' }}>Loading 3D Models...</span>
            </Html>
          }
        >
          <Stage environment="city" intensity={0.5}>
            {/* Group groups all the parts together so Stage can center the whole assembly */}
            <group>
              {urlArray.map((url, index) => (
                <Model key={index} url={url} />
              ))}
            </group>
          </Stage>
        </Suspense>
        <OrbitControls enableZoom={true} makeDefault />
      </Canvas>
    </div>
  );
};

export default STLViewer;