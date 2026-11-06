# Edit and delete discussions

ZIP 9 adds author-only editing and deletion for existing discussions.

## API

- `PATCH /api/posts/:id` — authenticated update of title, category, and content.
- `DELETE /api/posts/:id` — authenticated permanent deletion.

Both endpoints validate the MongoDB ObjectId, require a valid bearer token, check that the authenticated user owns the post, and return `403` for another user's post. Updates reuse the same title/content/category rules as creation and Mongoose timestamps update `updatedAt`.

## Frontend

The discussion detail page displays edit/delete controls only when the signed-in user's locally stored ID matches the author ID. This is only a user-interface convenience; the backend independently enforces ownership.

Editing opens a validated form prefilled with the current post. Saving sends a PATCH request and refreshes the displayed post. Deleting requires a browser confirmation and then returns to the discussion feed. A missing/expired session redirects to login.

## Local verification

1. Register two separate student accounts.
2. Account A creates a discussion.
3. While signed in as A, open that discussion and verify edit/delete controls appear.
4. Edit the title, category, and content; verify the updated values and update timestamp.
5. Sign out and sign in as B. Open A's discussion; owner controls should be hidden.
6. Using B's token, manually call PATCH and DELETE for A's post; both should return `403`.
7. Sign back in as A, delete the post, confirm the prompt, and verify it disappears from the feed.
