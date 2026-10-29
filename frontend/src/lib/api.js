import { API_URL } from './config.js';
import { getToken, clearToken } from './auth.js';

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path.startsWith('/') ? path : '/' + path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // On a 401 from a protected call (not during login/register): redirect to login
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/register')) {
      clearToken();
      window.location.href = '/login.html';
      throw new Error('Session expired. Please log in again.');
    }

    let message = 'Request failed';
    if (data && data.detail) {
      if (Array.isArray(data.detail)) {
        message = data.detail.map(err => err.msg || (typeof err === 'object' ? err.loc?.join('.') + ': ' + err.msg : JSON.stringify(err))).join(', ');
      } else if (typeof data.detail === 'string') {
        message = data.detail;
      }
    } else if (response.statusText) {
      message = response.statusText;
    }

    throw new Error(message);
  }

  return data;
}

