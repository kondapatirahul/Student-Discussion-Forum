# Discussion feed

ZIP 7 adds a public, read-only discussion feed.

## API

`GET /api/posts`

Optional query parameters:

- `page`: 1-based page number (default `1`)
- `limit`: page size from 1 to 20 (default `8`)
- `category`: one of Programming, Academics, Projects, Campus Life, Placements, General
- `search`: case-insensitive search across title and content (maximum 100 characters)
- `sort`: `latest` (default) or `oldest`

The response includes `data.posts`, pagination metadata, and the applied filters. Each post includes its author display name, category, creation date, and a short excerpt. The endpoint is public; creating a post still requires a bearer token.

## Frontend

Open `frontend/discussions.html` through Live Server. Use the search box, category selector, sort selector, and previous/next controls to browse the feed. The page uses textContent for post-provided content rather than injecting it as HTML.

## Local verification

1. Start MongoDB / confirm the Atlas URI is configured in `backend/.env`.
2. Start the backend with `npm run dev` from `backend/`.
3. Create at least one student account and publish a discussion.
4. Open `discussions.html` from the frontend Live Server origin.
5. Confirm the post appears, then test search, each category, sort order, and pagination with enough records.
