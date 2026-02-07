<div align="center" style="margin-bottom: 30px;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=a6d45b9eeaa2b43332f9159614997f2d5d746c5a&v=4" 
             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
    </a>
    <h1 align="center">Classroom Backend API</h1>
    <p align="center">
      The powerful and type-safe API engine for the Classroom Management System.
      <br />
      <a href="https://github.com/galilio2023/classroom-backend/issues">Report Bug</a>
      ·
      <a href="https://github.com/galilio2023/classroom-backend/issues">Request Feature</a>
    </p>
    <p align="center">
      <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
      <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
      <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    </p>
</div>

---

## 📖 1. About The Project

This project serves as the backend API for the Classroom Management System. It is a robust RESTful API built with Express.js that handles all business logic, database interactions, and data validation.

The core of this backend is its powerful data layer, built with **Drizzle ORM**, which provides a type-safe and efficient way to interact with our **Neon (Postgres)** database.

---

## 🛠️ 2. Tech Stack

This project leverages a modern, reliable, and scalable backend tech stack:

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Web Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Authentication:** [Better Auth](https://better-auth.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Environment Variables:** [dotenv](https://github.com/motdotla/dotenv)
*   **Live Reloading:** [tsx](https://github.com/esbuild-kit/tsx)

---

## 🏗️ 3. Architecture & Implementation Plan

We designed the system to be modular and scalable. Here is the architectural roadmap we followed:

### Phase 1: Core Academic Structure
*   **Goal:** Establish the fundamental hierarchy of the school.
*   **Implementation:**
    *   Created `departments` table (e.g., "Science", "Arts").
    *   Created `subjects` table (e.g., "Physics", "History") with a Many-to-One relationship to Departments.

### Phase 2: User Management & Authentication
*   **Goal:** Manage all users and secure the application.
*   **Decision:** We implemented a single `user` table with a `role` enum (`admin`, `teacher`, `student`) to simplify authentication and role management.
*   **Authentication:** We integrated the `better-auth` library to handle user registration, login, and session management.

### Phase 3: The Classroom Engine
*   **Goal:** Connect Subjects and Teachers to create actual Classes.
*   **Implementation:**
    *   Created `classes` table. It links a **Subject** to a **Teacher** (User).
    *   Added `schedules` as a JSON column to store flexible class timings.
    *   Created `enrollments` table to handle the Many-to-Many relationship between **Students** and **Classes**.

---

## 🗄️ 4. Database Schema

The database schema is defined in `src/db/schema/`. It is split into two logical parts:
*   **`app.ts`**: Contains the core application tables (`departments`, `subjects`, `classes`, `enrollments`).
*   **`auth.ts`**: Contains the tables required by `better-auth` (`user`, `session`, `account`, `verification`).

---

## 🔌 5. API Endpoints

All data endpoints under `/api/` are protected and require authentication.

### Auth (`/api/auth/*`)
*   Provided by `better-auth`. Handles registration, login, logout, and session management.

### Users (`/api/users`)
*   `GET /`: List users (Filter by `role`, `search`).
*   `GET /:id`: Get user details.

### Classes (`/api/classes`)
*   `GET /`: List classes (Filter by `subjectId`, `teacherId`, `status`).
*   ... (Standard CRUD)

### Subjects (`/api/subjects`)
*   `GET /`: List subjects.
*   ... (Standard CRUD)

### Departments (`/api/departments`)
*   `GET /`: List departments.
*   ... (Standard CRUD)

---

## 🚀 6. Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Neon database account.

### Installation
```bash
git clone https://github.com/galilio2023/classroom-backend.git
cd classroom-backend
npm install
```

### Environment Setup
Create a `.env` file in the root directory and add the following variables:
```env
# Get this from your Neon dashboard
DATABASE_URL="postgres://user:password@host/dbname"

# The URL of the frontend application
FRONTEND_URL="http://localhost:5173"

# A random 32-character string for signing session tokens
BETTER_AUTH_SECRET="your_random_32_character_secret_here"
```

### Database Migration
To create the tables in your database, run the migration command:
```bash
npm run db:migrate
```

### Running the App
```bash
npm run dev
```
The server will start on `http://localhost:8000`.

---

## 🔐 7. Authentication Deep Dive (`better-auth` Integration)

The key to this backend is understanding how `better-auth` integrates with Express. The core philosophy is that **`better-auth` is a self-contained authentication engine**. We do not build our own login or register routes; we configure the `better-auth` instance and then expose its pre-built handlers.

### Key Files & Concepts

#### `src/lib/auth.ts` - The Auth Engine Configuration

This is the most important file for authentication. It's where the `better-auth` instance is created and configured.

- **`drizzleAdapter`**: This connects `better-auth` to our database. Crucially, it only needs the authentication-specific schema (`user`, `session`, `account`).
- **`emailAndPassword`**: This section enables the classic email/password login strategy.
  - **`requireEmailVerification: false`**: This is a critical setting for development. By default, `better-auth` requires users to verify their email before they can log in. Since we haven't set up an email provider, this setting disables that check, allowing the login to succeed immediately after registration.
- **`user.additionalFields`**: This is the correct way to add custom fields to the `user` table. `better-auth` manages the schema for these fields internally, so we just need to declare them here.

#### `src/index.ts` - Routing & Middleware

This file orchestrates the entire Express application. The order of middleware and routes is critical.

- **`app.all("/api/auth/*splat", toNodeHandler(auth))`**: This is the magic line. It takes our configured `auth` instance and exposes all of its built-in endpoints under the `/api/auth/` path. This automatically creates routes like `/api/auth/signin/email`, `/api/auth/signup/email`, and `/api/auth/session`. The frontend client will talk to these endpoints directly.
- **`app.use("/api/...", protect, ...Router)`**: Our application's own data routes (like `/api/subjects` or `/api/users`) are registered separately. They are placed behind our custom `protect` middleware to secure them.

#### `src/middleware/protect.ts` - API Route Protection

This middleware is the gatekeeper for our data.

- **Purpose**: To ensure that no one can access our data endpoints (e.g., `GET /api/subjects`) without being logged in.
- **How it Works**:
  1. It runs on every request to a protected route.
  2. It uses `auth.api.getSession({ headers })` to check for a valid session cookie on the incoming request. This is a server-to-server check within the `better-auth` engine.
  3. If no session is found, it immediately returns a `401 Unauthorized` error, blocking the request.
  4. If a session *is* found, it calls `next()` to allow the request to proceed to the actual route handler.
  5. It also attaches the `user` object to the Express `req` object (`req.user = session.user`), making user data available to downstream middleware or routes in a type-safe way.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

<br />
<div align="center">
  <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
    <img src="./assets/tablawy.png" alt="Tablawy Signature" width="200" />
  </a>
</div>
