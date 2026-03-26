(function () {
  const API_BASE = 'http://localhost:3001/api/auth';

  // Attempts a real POST to the backend.
  // Falls back to a 650ms simulation if the server is unreachable (e.g. static demo).
  async function apiCall(endpoint, body) {
    try {
      await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (_) {
      // Backend not running — simulate a network round-trip for the demo
      await new Promise(function (resolve) { setTimeout(resolve, 650); });
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateEmail(email) {
    if (!email) {
      alert('Please enter an email address.');
      return false;
    }
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address (e.g., user@example.com).');
      return false;
    }
    return true;
  }

  // Mirrors Facebook's password requirements:
  // at least 8 characters, with uppercase, lowercase, a digit, and a special character.
  function validatePassword(password) {
    if (password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      alert('Password must include at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      alert('Password must include at least one lowercase letter.');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      alert('Password must include at least one number.');
      return false;
    }
    if (!/[!@#$%]/.test(password)) {
      alert('Password must include at least one special character (!, @, #, $, %).');
      return false;
    }
    return true;
  }

  // Toggles the password field between plain text and hidden,
  // and swaps the eye / eye-off icon to match.
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const iconEye = document.getElementById('icon-eye');
  const iconEyeOff = document.getElementById('icon-eye-off');
  toggleBtn.addEventListener('click', function () {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    iconEye.style.display    = isHidden ? 'none'   : 'inline';
    iconEyeOff.style.display = isHidden ? 'inline' : 'none';
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) return;

    await apiCall('/login', { email, password });
    window.location.href = 'loading.html';
  });

  const createBtn = document.getElementById('create-account');
  createBtn.addEventListener('click', async function () {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) return;
    if (!validatePassword(password)) return;

    await apiCall('/register', { email, password });
    window.location.href = 'loading.html';
  });
}());
