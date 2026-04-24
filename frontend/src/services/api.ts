import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Standard Django port
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if you switch to token auth later
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export { api };