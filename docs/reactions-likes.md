# Reactions and likes

CampusTalk uses one `Reaction` record for each user and target. The compound unique index on `(targetType, target, user)` prevents duplicate likes at the database level.

## API

- `POST /api/posts/:postId/reaction` — toggle the signed-in user's like on a discussion.
- `POST /api/posts/:postId/comments/:commentId/reaction` — toggle a like on a comment.
- `GET /api/posts` and `GET /api/posts/:id` — include `reactionCount` and `isLiked` (when a valid optional bearer token is supplied).
- `GET /api/posts/:postId/comments` — includes the same reaction fields for each comment.

Reaction endpoints require `Authorization: Bearer <token>`. Public reads still work without a token. The toggle response returns the new `liked` state and total count. Removing a discussion or comment also removes its associated reaction records.

## Manual checks

1. Sign in as Student A and like a discussion. The count should increase by one.
2. Click again. The count should decrease and the button should return to its unliked state.
3. Like a comment and repeat the toggle.
4. Sign in as Student B and like the same target. Both users should see the same total count, while each sees their own `isLiked` state.
5. Confirm a signed-out visitor can browse counts but is redirected to login when trying to like.
6. Confirm invalid target IDs and missing targets return clear API errors.

The source was syntax-checked for this increment. Live MongoDB and browser integration checks still need to be run in the local environment.
