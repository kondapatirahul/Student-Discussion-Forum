# Create discussion module

## Frontend
Open `frontend/create-post.html` through Live Server after logging in. The page requires a valid session token and redirects to login if none is present.

## API
`POST /api/posts`

Required header:
`Authorization: Bearer <JWT>`

Example JSON:
```json
{
  "title": "How should I prepare for data structures?",
  "category": "Academics",
  "content": "I am looking for a practical weekly plan to revise arrays, trees, graphs, and dynamic programming."
}
```

The API validates title length (5–140), description length (20–10000), and category. It stores the post with the authenticated user as author and returns a public post representation.

## Categories
Programming, Academics, Projects, Campus Life, Placements, and General.

## Run
Configure MongoDB and JWT settings in `backend/.env`, install dependencies from `backend/`, and run `npm run dev`.
