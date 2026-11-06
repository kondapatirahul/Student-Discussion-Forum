document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const message = document.getElementById('formMessage');
  const button = document.getElementById('registerButton');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  if (!form || !message || !button) return;

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `alert alert-${type}`;
  }

  function validatePasswordMatch() {
    const matches = password.value === confirmPassword.value;
    confirmPassword.setCustomValidity(matches ? '' : 'Passwords do not match');
    return matches;
  }

  confirmPassword.addEventListener('input', validatePasswordMatch);
  password.addEventListener('input', validatePasswordMatch);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.className = 'alert d-none';
    validatePasswordMatch();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      showMessage('Please check the highlighted fields.', 'warning');
      return;
    }

    button.disabled = true;
    button.textContent = 'Creating account…';

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim().toLowerCase(),
      password: password.value,
      confirmPassword: confirmPassword.value
    };

    try {
      const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        const details = Array.isArray(result.errors) ? ` ${result.errors.join(' ')}` : '';
        throw new Error((result.message || 'Registration failed.') + details);
      }

      form.reset();
      form.classList.remove('was-validated');
      showMessage('Your account has been created successfully. Login will be available in the next increment.', 'success');
    } catch (error) {
      showMessage(error.message || 'Unable to create your account. Please try again.', 'danger');
    } finally {
      button.disabled = false;
      button.textContent = 'Create account';
    }
  });
});
