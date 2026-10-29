import { apiFetch } from '../lib/api.js';
import { redirectIfLoggedIn } from '../lib/auth.js';

// If already logged in, redirect to Analyze page
redirectIfLoggedIn();

const form = document.getElementById('register-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name || !email || !password || !confirmPassword) {
    showAlert('Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters long.');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    // Redirect to login page with success flag
    window.location.href = '/login.html?registered=1';
  } catch (err) {
    showAlert(err.message || 'Registration failed.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

