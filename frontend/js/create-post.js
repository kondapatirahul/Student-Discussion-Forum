document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createPostForm');
  const message = document.getElementById('postMessage');
  const button = document.getElementById('publishButton');
  const content = document.getElementById('content');
  const counter = document.getElementById('contentCounter');

  if (!form || !message || !button) return;

  const token = window.CampusTalkSession.getToken();
  if (!token) {
    window.location.replace('login.html');
    return;
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `alert alert-${type}`;
  }

  function updateCounter() {
    counter.textContent = `${content.value.length} / 10000`;
  }

  content.addEventListener('input', updateCounter);
  updateCounter();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.className = 'alert d-none';

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      showMessage('Please complete all fields before publishing.', 'warning');
      return;
    }

    button.disabled = true;
    button.textContent = 'Publishing…';

    try {
      const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.elements.title.value.trim(),
          category: form.elements.category.value,
          content: content.value.trim()
        })
      });
      const result = await response.json();

      if (response.status === 401) {
        window.CampusTalkSession.clear();
        window.location.replace('login.html');
        return;
      }
      if (!response.ok || !result.success) {
        const errors = Array.isArray(result.errors) ? ` ${result.errors.join(' ')}` : '';
        throw new Error((result.message || 'The discussion could not be published.') + errors);
      }

      form.reset();
      form.classList.remove('was-validated');
      updateCounter();
      showMessage('Your discussion has been published successfully. Post listing will be available in a later increment.', 'success');
    } catch (error) {
      showMessage(error.message || 'Unable to publish your discussion. Please try again.', 'danger');
    } finally {
      button.disabled = false;
      button.textContent = 'Publish discussion';
    }
  });
});
