import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Geist fonts
import '@fontsource/geist-sans'
import '@fontsource/geist-mono'

// Initialize theme
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'system';
  const root = document.documentElement;
  
  if (savedTheme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(savedTheme);
  }
};

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
