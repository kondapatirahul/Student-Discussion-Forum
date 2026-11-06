# Discussion details

ZIP 8 adds a dedicated page for reading one discussion in full.

## API

`GET /api/posts/:id`

- Returns the complete post, category, author display name, creation time, and update time.
- Returns `400` when the ID is not a valid MongoDB ObjectId.
- Returns `404` when no post exists for a valid ID.
- This read endpoint is public. Post creation remains protected by JWT authentication.

## Frontend

The feed links each discussion title and its **Read full discussion** link to:

`discussion.html?id=<post-id>`

The detail page validates the ID format before requesting the API. Post content and author fields are rendered with `textContent`, and line breaks are preserved with CSS rather than interpreting post content as HTML.

## Local verification

1. Start the backend with a working MongoDB connection.
2. Publish a discussion while signed in.
3. Open `discussions.html` and select its title or **Read full discussion**.
4. Confirm the full content, category, author, and dates are shown.
5. Try an invalid ID and a valid but nonexistent ObjectId; verify the page displays a useful error.
