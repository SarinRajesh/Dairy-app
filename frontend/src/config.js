// Centralized API base URL
// Prefer environment variable; fallback to current origin (useful for proxies) or Render backend
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' ? window.__API_BASE_URL__ : '') ||
  'https://dairy-app-lx3h.onrender.com';


