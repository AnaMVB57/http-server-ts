# Chirpy

Chirpy is a RESTful HTTP server built with Node.js, TypeScript, and Express. It is a Twitter-like API that allows users to create accounts, post short messages called chirps, and authenticate using JWTs. The project was built as part of the Boot.dev backend development curriculum.

## What it does

- User registration and login with hashed passwords using Argon2
- JWT-based authentication for protected endpoints
- Create, read, and delete chirps (short messages up to 140 characters)
- Automatic profanity filtering on chirp content
- Admin metrics endpoint to track server traffic
- Chirpy Red membership upgrades via Polka webhook integration
- Database persistence with PostgreSQL and Drizzle ORM
- Automatic database migrations on server startup

## Tech stack

- Runtime: Node.js 22.15.0
- Language: TypeScript
- Framework: Express
- Database: PostgreSQL 16+
- ORM: Drizzle ORM
- Password hashing: Argon2
- Authentication: JSON Web Tokens (jsonwebtoken)
- Testing: Vitest

## For Windows users

This project was developed using WSL 2 (Windows Subsystem for Linux). Running it natively on Windows is not supported. All commands below should be run from a WSL terminal.

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js 22.15.0
- PostgreSQL 16+
- WSL 2 (Windows users only)

### Node version management

This project includes an `.nvmrc` file. If you use nvm, you can switch to the correct version with:

```bash
nvm use
```

## Database setup

Install PostgreSQL inside WSL:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Start the service:

```bash
sudo service postgresql start
```

Configure the user and database:

```bash
sudo -u postgres psql
```

Inside psql:

```sql
CREATE DATABASE chirpy;
ALTER USER postgres PASSWORD 'your_password';
\q
```

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/http-server-ts
cd http-server-ts
```

Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the root of the project. This file is not committed to Git.

```
DB_URL=postgres://postgres:your_password@localhost:5432/chirpy?sslmode=disable
PLATFORM=dev
TOKEN_SECRET=your_jwt_secret
POLKA_KEY=your_polka_api_key
```

### Environment variables reference

| Variable | Description | Required |
|----------|-------------|----------|
| DB_URL | PostgreSQL connection string | Yes |
| PLATFORM | Set to `dev` to enable the reset endpoint | Yes |
| TOKEN_SECRET | Secret used to sign and verify JWTs | Yes |
| POLKA_KEY | API key used to authenticate Polka webhooks | Yes |

You can generate a secure JWT secret with:

```bash
openssl rand -base64 64
```

Migrations run automatically when the server starts, so no manual migration step is needed.

## Running the server

```bash
npm run dev
```

The server will start on `http://localhost:8080`.

## Running the tests

```bash
npm test
```

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # JWT and API key helpers
│   │   ├── chirps/        # Chirp handlers (create, get, delete)
│   │   ├── login/         # Login handler
│   │   ├── users/         # User handlers (create, update)
│   │   └── webhooks/      # Polka webhook handler
│   ├── assets/            # Static files (logo)
│   └── middleware/
│       ├── error/         # Custom error classes and error handler
│       ├── middlewareLogResponses.ts
│       └── middlewareMetricsInc.ts
├── db/
│   ├── migrations/        # Auto-generated Drizzle migration files
│   ├── queries/
│   │   ├── chirps/        # Chirp query functions
│   │   ├── refresh_tokens/ # Refresh token query functions
│   │   └── users/         # User query functions
│   ├── schema.ts          # Drizzle table definitions
│   └── index.ts           # Database connection
├── test/                  # Vitest unit tests
├── config.ts              # Environment variable loading and config object
└── index.ts               # Express app setup and route registration
```

## Authentication flow

1. A user registers via `POST /api/users` with an email and password
2. The password is hashed with Argon2 before being stored
3. The user logs in via `POST /api/login` and receives a signed JWT
4. Protected endpoints require the JWT in the `Authorization` header: `Bearer <token>`
5. The server validates the token and extracts the user ID on each request

Webhook endpoints from Polka use a separate API key mechanism via `Authorization: ApiKey <key>`.

## Error handling

The server uses a set of custom error classes that map to HTTP status codes:

| Class | Status code |
|-------|-------------|
| BadRequestError | 400 |
| UnauthorizedError | 401 |
| ForbiddenError | 403 |
| NotFoundError | 404 |

Unhandled errors are caught by a global error middleware and returned as a generic `500` response without leaking internal details to the client.

## API overview

### Public endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Readiness check |
| POST | /api/users | Create a new user |
| POST | /api/login | Login and receive a JWT |
| GET | /api/chirps | Get all chirps |
| GET | /api/chirps/:id | Get a chirp by ID |

### Authenticated endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/chirps | Create a new chirp |
| PUT | /api/users | Update email and password |
| DELETE | /api/chirps/:id | Delete a chirp |

### Admin endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/metrics | View request hit count |
| POST | /admin/reset | Reset hit count and users (dev only) |

### Webhook endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/polka/webhooks | Handle Polka membership events |

## Known limitations

- JWTs are not revocable. There is no refresh token or logout mechanism in this project.
- The server does not use HTTPS. In production, it should run behind a reverse proxy like Nginx with TLS termination.
- The `POST /admin/reset` endpoint deletes all users and should only be accessible in development. This is enforced via the `PLATFORM` environment variable.