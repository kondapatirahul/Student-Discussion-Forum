# Comments and replies

ZIP 10 adds authenticated comments and one-level replies to each discussion.

## API

- `GET /api/posts/:postId/comments?page=1&limit=20` — public, paginated comment list.
- `POST /api/posts/:postId/comments` — authenticated comment or reply. Body: `{ "content": "...", "parentId": null }`; use a root comment ID for a reply.
- `PATCH /api/posts/:postId/comments/:commentId` — authenticated author-only edit.
- `DELETE /api/posts/:postId/comments/:commentId` — authenticated author-only delete.

Comment content must contain 2–2000 characters. Replies are one level deep. The API verifies that a reply target belongs to the same discussion. Deleting a root comment also deletes its direct replies. Each comment stores its discussion, author, optional parent, and timestamps.

## Frontend

The discussion detail page now includes a comment composer, reply context, comment count, comment list, and pagination. Signed-out visitors can read comments; signing in is required to add a comment or reply. Authors can edit or delete their own comments. All user-generated text is inserted with `textContent`.

## Local verification

1. Start MongoDB and the API.
2. Sign in as Student A and publish a discussion.
3. Add a root comment and a reply.
4. Sign in as Student B and add another comment.
5. Verify each student only sees edit/delete controls for their own comments.
6. Try editing/deleting another student's comment using the API; expect `403`.
7. Delete a root comment and verify its reply is also removed.
8. Test empty state and pagination.
