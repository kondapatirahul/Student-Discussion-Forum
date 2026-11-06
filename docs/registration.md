# Student registration module

## Frontend
Open `frontend/register.html` using Live Server. The form collects a full name, email, password, and confirmation.

## API
`POST /api/auth/register`

Example request body:

```json
{
  "name": "A Student",
  "email": "student@example.com",
  "password": "example123",
  "confirmPassword": "example123"
}
```

Successful response returns HTTP 201 with a public user profile. Password hashes are never returned.

## Validation
- Name: 2–80 characters
- Email: valid format, normalized to lowercase
- Password: 8–72 characters, at least one letter and one number
- Confirmation must match
- Duplicate email returns HTTP 409

## Database
The `User` model stores a bcrypt password hash with cost factor 12. Set `MONGODB_URI` in `backend/.env` before testing registration. The unique email index provides a database-level duplicate safeguard.

## Run
From `backend/`, run `npm install` then `npm run dev`. Open the registration page with Live Server.
