
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { clearAllCache } from './utils/cacheUtils'

// Clear any potentially stale caches on application startup
// This ensures users always get fresh data when the app loads
clearAllCache();

// Add a comment to document this approach
// Note: We could also use window.addEventListener('load', clearAllCache)
// but doing it immediately ensures the first render has fresh data

createRoot(document.getElementById("root")!).render(<App />);
