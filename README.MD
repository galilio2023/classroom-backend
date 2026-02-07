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

### Phase 2: User Management (The "One Table" Strategy)
*   **Goal:** Manage all people (Teachers, Students, Admins) efficiently.
*   **Decision:** Instead of creating separate tables for each type, we implemented a single `users` table with a `role` enum (`admin`, `teacher`, `student`).
*   **Benefit:** Simplifies authentication and allows for flexible role management.

### Phase 3: The Classroom Engine
*   **Goal:** Connect Subjects and Teachers to create actual Classes.
*   **Implementation:**
    *   Created `classes` table. It links a **Subject** to a **Teacher** (User).
    *   Added `schedules` as a JSON column to store flexible class timings (e.g., `[{ day: "Mon", time: "10am" }]`).
    *   Created `enrollments` table to handle the Many-to-Many relationship between **Students** and **Classes**.

---

## 🗄️ 4. Database Schema

The database schema is defined in `src/db/schema/`. It consists of five primary tables:

*   **`departments`**: Stores academic departments.
*   **`subjects`**: Stores individual subjects. Linked to `departments`.
*   **`users`**: Stores all system users. Distinguished by `role`.
*   **`classes`**: Represents a specific course offering. Linked to `subjects` and `users` (teacher).
*   **`enrollments`**: Links `users` (students) to `classes`.

---

## 🔌 5. API Endpoints

### Users (`/api/users`)
*   `GET /`: List users (Filter by `role`, `search`).
*   `GET /:id`: Get user details.
*   `POST /`: Create a new user.
*   `PUT /:id`: Update a user.
*   `DELETE /:id`: Delete a user.

### Classes (`/api/classes`)
*   `GET /`: List classes (Filter by `subjectId`, `teacherId`, `status`). Returns full relation data (Subject name, Teacher name).
*   `GET /:id`: Get class details.
*   `POST /`: Create a new class (Auto-generates `inviteCode`).
*   `PUT /:id`: Update a class.
*   `DELETE /:id`: Delete a class.

### Subjects (`/api/subjects`)
*   `GET /`: List subjects.
*   `POST /`: Create a subject.
*   ... (Standard CRUD)

### Departments (`/api/departments`)
*   `GET /`: List departments.
*   `POST /`: Create a department.
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
Create a `.env` file in the root directory and add your Neon database connection string:
```env
# Get this from your Neon dashboard
DATABASE_URL="postgres://user:password@host/dbname"
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
