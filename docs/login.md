# Student login module

## Login page
Open `frontend/login.html` with Live Server. Submit the email and password used during registration.

## API endpoints

- `POST /api/auth/login` — verifies credentials and returns a signed JWT.
- `GET /api/auth/me` — returns the authenticated user's public profile.

Send the protected endpoint header as `Authorization: Bearer <token>`.

## Token configuration

Set a long, random `JWT_SECRET` in `backend/.env`. `JWT_EXPIRES_IN` defaults to `1d`. Never commit the real secret.

The frontend stores the returned token in `sessionStorage`, which is cleared when the browser tab session ends. For a production deployment, consider an HttpOnly, Secure, SameSite cookie design and CSRF protections.

## Run
From `backend/`, run `npm install` and `npm run dev`. Ensure MongoDB Atlas is configured and the JWT settings are present in `.env`.
