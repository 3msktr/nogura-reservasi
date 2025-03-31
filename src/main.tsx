
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove StrictMode to reduce double-rendering and caching
createRoot(document.getElementById("root")!).render(<App />);
