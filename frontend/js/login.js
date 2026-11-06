document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');
  const button = document.getElementById('loginButton');

  if (!form || !message || !button) return;

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `alert alert-${type}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.className = 'alert d-none';

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      showMessage('Enter your email address and password.', 'warning');
      return;
    }

    button.disabled = true;
    button.textContent = 'Logging in…';

    try {
      const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.elements.email.value.trim().toLowerCase(),
          password: form.elements.password.value
        })
      });
      const result = await response.json();

      if (!response.ok || !result.success || !result.data?.token) {
        throw new Error(result.message || 'Unable to log in.');
      }

      // Session storage limits token persistence to this browser tab session.
      window.CampusTalkSession.save(result.data.token, result.data.user);
      showMessage(`Welcome back, ${result.data.user.name}. Redirecting to your dashboard…`, 'success');
      window.setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } catch (error) {
      showMessage(error.message || 'Login failed. Please try again.', 'danger');
    } finally {
      button.disabled = false;
      button.textContent = 'Log in';
    }
  });
});
