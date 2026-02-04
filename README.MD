# Classroom Backend API

<div align="center" style="margin: 30px 0;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=d419091187e0ac09e080581ea5b3096623df8beb&v=4" 
             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    </a>
    <h3 align="center">Robust Node.js Backend for Classroom Management</h3>
    <p align="center">
        Built with <b>Express.js</b>, <b>TypeScript</b>, <b>Drizzle ORM</b>, and <b>Neon Postgres</b>.
    </p>
</div>

---

## 📖 Overview

This project serves as the backend API for the Classroom Management System. It is designed to be scalable, type-safe, and easy to maintain. It provides a RESTful API to manage core educational entities like **Departments** and **Subjects**, leveraging the power of modern tools like Drizzle ORM for database interactions and TypeScript for code reliability.

## 🛠️ Tech Stack

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/)) - Serverless Postgres.
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) - Lightweight and type-safe TypeScript ORM.
*   **Migration Tool:** [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) - For managing database schema changes.

## 📂 Project Structure

A clean and organized structure ensures maintainability and scalability.

```
classroom-backend/
├── src/
│   ├── db/                 # Database configuration and schema
│   │   ├── schema/         # Drizzle schema definitions
│   │   │   ├── app.ts      # Tables: departments, subjects
│   │   │   └── index.ts    # Schema exports
│   │   ├── index.ts        # Database client instance (db)
│   │   └── db.ts           # Connection pool setup
│   ├── routes/             # API Route Handlers
│   │   ├── departments.ts  # CRUD for Departments
│   │   └── subjects.ts     # CRUD for Subjects
│   └── index.ts            # Application Entry Point (Server setup)
├── drizzle/                # Generated SQL migration files
├── .env                    # Environment variables (Git-ignored)
├── drizzle.config.ts       # Drizzle Kit configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn
*   A Neon Postgres database connection string.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd classroom-backend
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add your database connection string and port:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
PORT=8000
```

### 4. Database Migration

Generate and apply the database schema:

```bash
# Generate SQL migrations based on schema.ts
npm run db:generate

# Apply migrations to the database
npm run db:migrate
```

### 5. Running the Server

Start the development server with hot-reloading:

```bash
npm run dev
```

The server will start at `http://localhost:8000`.

## 🔌 API Endpoints

All API routes are prefixed with `/api`.

### 🏫 Departments (`/api/departments`)

| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all departments | `search`, `page`, `limit` |
| `GET` | `/:id` | Get a single department | - |
| `POST` | `/` | Create a new department | Body: `{ code, name, description }` |
| `PUT` | `/:id` | Update a department | Body: `{ code, name, description }` |
| `DELETE` | `/:id` | Delete a department | - |

### 📚 Subjects (`/api/subjects`)

| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all subjects | `search`, `department`, `page`, `limit` |
| `GET` | `/:id` | Get a single subject | - |
| `POST` | `/` | Create a new subject | Body: `{ code, name, description, departmentId }` |
| `PUT` | `/:id` | Update a subject | Body: `{ code, name, description, departmentId }` |
| `DELETE` | `/:id` | Delete a subject | - |

## 💾 Database Schema

### `departments` Table
*   `id`: Integer (Primary Key, Auto-increment)
*   `code`: String (Unique, e.g., "CSE")
*   `name`: String (e.g., "Computer Science")
*   `description`: String
*   `created_at`: Timestamp
*   `updated_at`: Timestamp

### `subjects` Table
*   `id`: Integer (Primary Key, Auto-increment)
*   `code`: String (Unique, e.g., "CS101")
*   `name`: String (e.g., "Intro to Programming")
*   `description`: String
*   `department_id`: Integer (Foreign Key -> departments.id)
*   `created_at`: Timestamp
*   `updated_at`: Timestamp

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
