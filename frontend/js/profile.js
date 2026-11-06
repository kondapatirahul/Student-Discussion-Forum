document.addEventListener('DOMContentLoaded', async () => {
  const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
  const message = document.getElementById('profileMessage');
  const logoutButtons = [
    document.getElementById('logoutButton'),
    document.getElementById('profileLogoutButton')
  ].filter(Boolean);

  logoutButtons.forEach((button) => {
    button.addEventListener('click', () => window.CampusTalkSession.logout(apiBase));
  });

  const token = window.CampusTalkSession.getToken();
  if (!token) {
    window.location.replace('login.html');
    return;
  }

  try {
    const response = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();

    if (!response.ok || !result.success || !result.data?.user) {
      throw new Error(result.message || 'Your profile could not be loaded.');
    }

    const user = result.data.user;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileRole').textContent = user.role;
    document.getElementById('profileStatus').textContent = 'Active';
    document.getElementById('profileInitials').textContent = user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    const cachedUser = window.CampusTalkSession.getUser();
    if (!cachedUser || cachedUser.id !== user.id) {
      window.CampusTalkSession.save(token, user);
    }

    message.className = 'alert alert-success';
    message.textContent = 'Your profile has been loaded securely.';
  } catch (error) {
    window.CampusTalkSession.clear();
    message.className = 'alert alert-warning';
    message.textContent = `${error.message} Please log in again.`;
    window.setTimeout(() => window.location.replace('login.html'), 900);
  }
});
