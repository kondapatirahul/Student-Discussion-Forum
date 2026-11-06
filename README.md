# Student Discussion Forum

A full-stack discussion platform for students to ask questions, share knowledge, and discuss academic topics.

## ZIP 1 — Foundation

This increment establishes the project structure, Express API, MongoDB connection configuration, health endpoint, static frontend shell, and local development instructions. The dashboard page and overview API are included in ZIP 2. Student registration is included in ZIP 3. Student login and JWT-protected profile lookup are included in ZIP 4. Profile viewing and browser-session logout are included in ZIP 5. Authenticated discussion creation is included in ZIP 6. Public discussion browsing with search, category filters, sorting, and pagination is included in ZIP 7. Individual discussion detail pages and the single-post API are included in ZIP 8. Author-only editing and deletion are included in ZIP 9.

## Stack

- Frontend: HTML, CSS, vanilla JavaScript, Bootstrap 5
- Backend: Node.js, Express.js
- Database: MongoDB Atlas (Mongoose)
- Deployment target: Vercel (frontend) + Render (backend)

## Requirements

- Node.js 18+
- npm
- MongoDB Atlas database (optional for initial server startup; required for database-backed modules)

## Run locally

### 1. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Set `MONGODB_URI` in `backend/.env` when your Atlas cluster is ready.

### 2. Start the API

```bash
npm run dev
```

The API runs at `http://localhost:5000` by default.

- `GET /api/health` — service status
- `GET /api/dashboard/overview` — initial dashboard summary
- `POST /api/auth/register` — create a student account
- `POST /api/auth/login` — verify credentials and issue a JWT
- `GET /api/auth/me` — return the authenticated student profile
- `GET /api/posts` — browse discussions with pagination, category filtering, search, and sorting\n- `GET /api/posts/:id` — read one complete discussion
- `PATCH /api/posts/:id` — update a discussion owned by the authenticated student
- `DELETE /api/posts/:id` — delete a discussion owned by the authenticated student\n- `POST /api/posts` — create an authenticated student discussion
- `POST /api/auth/logout` — clear the authenticated browser session
- `GET /api` — API welcome response

### 3. Open the frontend

Open `frontend/index.html` in a browser, or serve the `frontend` folder with VS Code Live Server. The frontend reads the API base URL from `frontend/js/config.js`.

## Repository workflow

Use one short-lived branch per independently reviewable feature. Keep commits meaningful and only commit working changes. Merge each PR before starting work that depends on it.

```bash
git checkout main
git pull origin main
git checkout -b setup
# make a small, real change
git add .
git commit -m "adding project setup"
git push -u origin setup
```

Create a PR from `setup` into `main` on GitHub. Repeat with the next branch after merging.

## Environment variables

See `backend/.env.example`. Never commit `.env` or production secrets.

## Planned increments

1. Foundation and homepage
2. Dashboard page and overview API
3. Student registration and password hashing
4. Student login and protected profile endpoint
5. Student profile page and session logout
6. Authenticated discussion creation
7. Public discussion feed, search, category filters, sorting, and pagination
8. Individual discussion detail page and single-post API
9. Author-only discussion editing and deletion
10. Comments, replies, reactions, and notifications
11. Administration, moderation, hardening, and deployment
