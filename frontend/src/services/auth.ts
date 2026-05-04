import { api } from './api';

const AUTH_TOKEN_KEY = 'contacts_auth_token';
const AUTH_USERNAME_KEY = 'contacts_auth_username';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

export function getAuthenticatedUsername() {
  return localStorage.getItem(AUTH_USERNAME_KEY) ?? '';
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export async function login(username: string, password: string) {
  const response = await api.post<{ token: string; username: string }>('/auth/login', {
    username,
    password,
  });

  localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
  localStorage.setItem(AUTH_USERNAME_KEY, response.data.username);
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
}
