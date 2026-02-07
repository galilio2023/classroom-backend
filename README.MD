# Classroom Backend

This is the backend server for the Classroom application, built with Express.js. It provides a RESTful API for managing application data and handles user authentication using the `better-auth` library.

## Project Setup

### 1. Installation

Install the necessary dependencies:
```sh
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project. This file is critical for configuring the application.

```env
# The full connection string for your Neon (or other Postgres) database.
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# The URL of the frontend application for CORS configuration.
FRONTEND_URL="http://localhost:5173"

# A secret string used by better-auth to sign session tokens.
# Generate a random 32-character string for this.
BETTER_AUTH_SECRET="your_random_32_character_secret_here"
```

### 3. Database Migrations

This project uses Drizzle ORM to manage the database schema.

- **To generate a new migration file** after making changes to the schema (`src/db/schema/`):
  ```sh
  npm run db:generate
  ```

- **To apply pending migrations** to the database:
  ```sh
  npm run db:migrate
  ```

### 4. Running the Development Server

Start the server in watch mode. It will automatically restart when you make changes.
```sh
npm run dev
```
The server will be running at `http://localhost:8000`.

---

## Core Architecture: `better-auth` Integration

The key to this backend is understanding how `better-auth` integrates with Express. The core philosophy is that **`better-auth` is a self-contained authentication engine**. We do not build our own login or register routes; we configure the `better-auth` instance and then expose its pre-built handlers.

### Key Files & Concepts

#### 1. `src/lib/auth.ts` - The Auth Engine Configuration

This is the most important file for authentication. It's where the `better-auth` instance is created and configured.

- **`drizzleAdapter`**: This connects `better-auth` to our database. Crucially, it only needs the authentication-specific schema (`user`, `session`, `account`).
- **`emailAndPassword`**: This section enables the classic email/password login strategy.
  - **`requireEmailVerification: false`**: This is a critical setting for development. By default, `better-auth` requires users to verify their email before they can log in. Since we haven't set up an email provider, this setting disables that check, allowing the login to succeed immediately after registration.
- **`user.additionalFields`**: This is the correct way to add custom fields to the `user` table. `better-auth` manages the schema for these fields internally, so we just need to declare them here.

#### 2. `src/index.ts` - Routing & Middleware

This file orchestrates the entire Express application. The order of middleware and routes is critical.

- **`app.all("/api/auth/*splat", toNodeHandler(auth))`**: This is the magic line. It takes our configured `auth` instance and exposes all of its built-in endpoints under the `/api/auth/` path. This automatically creates routes like `/api/auth/signin/email`, `/api/auth/signup/email`, and `/api/auth/session`. The frontend client will talk to these endpoints directly.
- **`app.use("/api/...", protect, ...Router)`**: Our application's own data routes (like `/api/subjects` or `/api/users`) are registered separately. They are placed behind our custom `protect` middleware to secure them.

#### 3. `src/middleware/protect.ts` - API Route Protection

This middleware is the gatekeeper for our data.

- **Purpose**: To ensure that no one can access our data endpoints (e.g., `GET /api/subjects`) without being logged in.
- **How it Works**:
  1. It runs on every request to a protected route.
  2. It uses `auth.api.getSession({ headers })` to check for a valid session cookie on the incoming request. This is a server-to-server check within the `better-auth` engine.
  3. If no session is found, it immediately returns a `401 Unauthorized` error, blocking the request.
  4. If a session *is* found, it calls `next()` to allow the request to proceed to the actual route handler (e.g., fetching subjects from the database).
  5. It also attaches the `user` object to the Express `req` object (`req.user = session.user`), making user data available to downstream middleware or routes in a type-safe way.
