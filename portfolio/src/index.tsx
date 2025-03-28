import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Get the root element
const container = document.getElementById('root');

// Create a root
if (container) {
  const root = createRoot(container);
  
  // Render the App component to the root
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
