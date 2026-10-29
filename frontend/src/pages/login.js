import { apiFetch } from '../lib/api.js';
import { redirectIfLoggedIn, setToken, setUserName } from '../lib/auth.js';

// If already logged in, redirect to Analyze page
redirectIfLoggedIn();

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const alertBox = document.getElementById('alert-box');

function showAlert(message, isSuccess = false) {
  alertBox.textContent = '';
  const div = document.createElement('div');
  div.className = isSuccess ? 'alert alert-success' : 'alert alert-error';
  div.textContent = message;
  alertBox.appendChild(div);
}

function clearAlert() {
  alertBox.textContent = '';
}

// Show success message if redirected from register page
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('registered') === '1') {
  showAlert('Account created successfully! Please sign in.', true);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showAlert('Please fill in all fields.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(res.access_token);

    // Fetch user details to get display name
    const me = await apiFetch('/auth/me');
    setUserName(me.name);

    window.location.href = '/index.html';
  } catch (err) {
    showAlert(err.message || 'Login failed.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});

