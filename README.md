# Student Discussion Forum

A full-stack discussion platform for students to ask questions, share knowledge, and discuss academic topics.

## ZIP 1 — Foundation

This increment establishes the project structure, Express API, MongoDB connection configuration, health endpoint, static frontend shell, and local development instructions. The dashboard page and overview API are included in ZIP 2. Student registration is included in ZIP 3. Login, logout, and discussion CRUD are reserved for later increments.

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
4. Login, logout, and profile
5. Posts, details, editing, deletion, search, and categories
6. Comments, replies, reactions, and notifications
7. Administration, moderation, hardening, and deployment
