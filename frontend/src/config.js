// Centralized API base URL
// Priority: env var -> explicit window override -> auto-detect localhost -> Render backend
const detectLocalApiBase = () => {
  if (typeof window === 'undefined') return '';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ? 'http://localhost:5000' : '';
};

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' ? window.__API_BASE_URL__ : '') ||
  detectLocalApiBase() ||
  'https://dairy-app-lx3h.onrender.com';


