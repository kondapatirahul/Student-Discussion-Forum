document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('year');
  const statusButton = document.getElementById('apiStatusButton');
  const statusElement = document.getElementById('apiStatus');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  if (!statusButton || !statusElement) return;

  statusButton.addEventListener('click', async () => {
    statusButton.disabled = true;
    statusElement.textContent = 'Checking the API...';

    try {
      const baseUrl = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/health`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'The API returned an unexpected response.');
      }

      statusElement.textContent = `API is ${result.status}. Database: ${result.database}.`;
    } catch (error) {
      statusElement.textContent = `Could not reach the API. ${error.message}`;
    } finally {
      statusButton.disabled = false;
    }
  });
});
