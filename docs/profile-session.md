# Profile and session management

## Profile page
Open `frontend/profile.html` after logging in. The page calls `GET /api/auth/me` with the bearer token and displays the profile returned by the server. If the token is missing or invalid, the user is redirected to login.

## Logout
The logout controls call `POST /api/auth/logout` when a token is available, then clear the browser's `sessionStorage` and redirect to `login.html`. Because access tokens are stateless JWTs, clearing the browser session removes the local credential; a copied JWT remains valid until expiry. Keep token expiry short and consider rotating refresh tokens or server-side revocation for a production system.

## Shared session helper
`frontend/js/session.js` centralizes token and user storage, retrieval, clearing, and logout behavior.
