export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getUserName() {
  return localStorage.getItem('userName') || 'User';
}

export function setUserName(name) {
  localStorage.setItem('userName', name);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
}

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

export function redirectIfLoggedIn() {
  const token = getToken();
  if (token) {
    window.location.href = '/index.html';
  }
}

export function logout() {
  clearToken();
  window.location.href = '/login.html';
}

