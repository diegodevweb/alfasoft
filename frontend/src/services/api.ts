import axios from 'axios';
import { getAuthToken } from './auth';

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  if (window.location.port === '5173') {
    return 'http://localhost:3000';
  }

  return window.location.origin;
}

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
