import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n.js'

window.__APP_CONFIG__ = window.__APP_CONFIG__ || {}

// Note: StrictMode is disabled in development to avoid double-rendering issues with map adapters
// StrictMode helps identify potential bugs but causes map initialization issues since containers
// are rendered twice. This can be re-enabled after map adapter lifecycle is fully optimized.
createRoot(document.getElementById('root')).render(
  <App />
)
