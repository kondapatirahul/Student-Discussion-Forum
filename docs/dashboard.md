# Dashboard module

## Page
Open `frontend/dashboard.html` through Live Server. The homepage links to this page through the Dashboard navigation item.

## API contract

`GET /api/dashboard/overview`

Successful response:

```json
{
  "success": true,
  "data": {
    "totalDiscussions": 0,
    "activeStudents": 0,
    "totalComments": 0,
    "categories": [],
    "recentDiscussions": [],
    "message": "Your dashboard is ready."
  }
}
```

The current foundation returns zero counts and empty recent discussions because user, post, and comment persistence are planned for later increments. The UI renders category and metric values from the API response and displays a connection message when the API is unavailable.

## Verification

1. Start the backend with `npm run dev` from `backend/`.
2. Visit `http://localhost:5000/api/dashboard/overview`.
3. Open `frontend/dashboard.html` with Live Server.
4. Confirm the three metrics render as zero and the four starter categories appear.
5. Stop the backend and refresh to confirm the connection error is visible.
