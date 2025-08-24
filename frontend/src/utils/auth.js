// Token management utilities
export const getToken = () => {
  return localStorage.getItem('token');
};

export const getTokenData = () => {
  const tokenData = localStorage.getItem('tokenData');
  return tokenData ? JSON.parse(tokenData) : null;
};

export const isTokenValid = () => {
  const token = getToken();
  const tokenData = getTokenData();
  
  if (!token || !tokenData || !tokenData.expiresAt) {
    return false;
  }
  
  return new Date().getTime() < tokenData.expiresAt;
};

export const setToken = (token) => {
  const tokenData = {
    token,
    expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  localStorage.setItem('token', token);
  localStorage.setItem('tokenData', JSON.stringify(tokenData));
};

export const clearToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenData');
  localStorage.removeItem('user');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API request helper with authentication
export const apiRequest = async (url, options = {}) => {
  const headers = getAuthHeaders();
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };
  
  const response = await fetch(url, config);
  
  if (response.status === 401) {
    // Token is invalid, clear auth data
    clearToken();
    window.location.href = '/login';
    return null;
  }
  
  return response;
};
