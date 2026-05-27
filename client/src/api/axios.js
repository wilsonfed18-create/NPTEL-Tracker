import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: '/api'
});

// Interceptor: automatically attach the JWT token to every request
// This runs before every API call
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

/*
 * FILE EXPLANATION:
 * This file sets up a custom axios instance for making API calls.
 * baseURL '/api' means all requests go to our backend server.
 * The interceptor automatically adds the JWT token to every request header.
 * This way we don't have to manually add the token in every component.
 * localStorage.getItem('token') reads the token saved during login.
 */
