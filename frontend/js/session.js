(() => {
  const TOKEN_KEY = 'campustalk_token';
  const USER_KEY = 'campustalk_user';

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_error) {
      clear();
      return null;
    }
  }

  function save(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  async function logout(apiBase) {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${apiBase}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (_error) {
        // Local session removal must still work when the network is unavailable.
      }
    }
    clear();
    window.location.href = 'login.html';
  }

  window.CampusTalkSession = { getToken, getUser, save, clear, logout };
})();
