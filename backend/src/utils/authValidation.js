const EMAIL_PATTERN = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function validateRegistration(payload) {
  const errors = [];
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const confirmPassword = typeof payload.confirmPassword === 'string' ? payload.confirmPassword : '';

  if (name.length < 2 || name.length > 80) {
    errors.push('Name must be between 2 and 80 characters.');
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    errors.push('Enter a valid email address.');
  }
  if (password.length < 8 || password.length > 72) {
    errors.push('Password must be between 8 and 72 characters.');
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one letter and one number.');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }

  return {
    valid: errors.length === 0,
    errors,
    values: { name, email, password }
  };
}

module.exports = { validateRegistration };
