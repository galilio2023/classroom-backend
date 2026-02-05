# Classroom Backend: The Engine Room

<div align="center" style="margin: 30px 0;">
    <a href="https://ibrahim-tablawy-portfolio.vercel.app/">
        <img alt="Author Avatar" 
             src="https://avatars.githubusercontent.com/u/110768301?s=400&u=d419091187e0ac09e080581ea5b3096623df8beb&v=4" 
             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    </a>
    <h3 align="center">API Server for Classroom Management</h3>
    <p align="center">
        Built with <b>Node.js</b>, <b>Express</b>, <b>Drizzle ORM</b>, and <b>Neon</b>.
    </p>
</div>

---

## 📖 1. Overview & Core Concepts

This project serves as the backend API for the Classroom Management System. It is a robust RESTful API built with Express.js that handles all business logic, database interactions, and data validation.

The core of this backend is its powerful data layer, built with **Drizzle ORM**, which provides a type-safe and efficient way to interact with our **Neon (Postgres)** database.

---

## 🛠️ 2. Tech Stack

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Web Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Environment Variables:** [dotenv](https://github.com/motdotla/dotenv)
*   **Live Reloading:** [tsx](https://github.com/esbuild-kit/tsx)

---

## 🗄️ 3. Database Schema

The database schema is defined in `src/db/schema/`. It consists of two primary tables:

*   **`departments`**: Stores academic departments (e.g., Computer Science, Mathematics).
*   **`subjects`**: Stores individual subjects (e.g., Intro to Programming). It has a **many-to-one relationship** with `departments` via the `departmentId` foreign key.

This structure allows each subject to belong to exactly one department.

---

## 🔄 4. The Data Flow: How a Request is Processed

Understanding the lifecycle of an API request is crucial. Here is what happens when the frontend requests a list of subjects with a search filter.

**Request:** `GET /api/subjects?search=math&page=1`

1.  **Request Received:** The Express server receives the incoming HTTP request.
2.  **Routing:** The request is routed to the `GET /` handler in `src/routes/subjects.ts`.
3.  **Parameter Extraction:** The code destructures the query string to get the `search`, `page`, and `limit` parameters:
    ```javascript
    const { search, page = 1, limit = 10 } = req.query;
    ```
4.  **Drizzle Query Building:**
    *   The backend dynamically builds a set of filter conditions. If `search` exists, it creates an `ilike` condition for both the subject `name` and `code`.
    *   It uses Drizzle's `count()` function to perform an efficient query to get the total number of matching records for pagination.
    *   It then builds the main query to select the subjects, applying the `where`, `limit`, and `offset` clauses.
5.  **SQL Execution:** Drizzle ORM translates the query object into raw, parameterized SQL and sends it to the Neon database via the `neon-http` driver.
    ```sql
    -- (Simplified) Example SQL for the count
    SELECT count(*)::int FROM "subjects" WHERE "name" ILIKE '%math%' OR "code" ILIKE '%math%';
    
    -- (Simplified) Example SQL for the data
    SELECT ... FROM "subjects" WHERE ... LIMIT 10 OFFSET 0;
    ```
6.  **Response Formatting:** The backend receives the data from the database and formats it into the specific JSON structure the frontend expects, including the `data` array and the `pagination` object.
7.  **Response Sent:** The server sends the JSON object back to the frontend with a `200 OK` status code.

---

## 🔌 5. API Endpoints

### Subjects (`/api/subjects`)
*   `GET /`: Get a paginated list of subjects.
    *   **Query Params:** `page`, `limit`, `search` (searches name and code), `department` (searches by department name).
*   `GET /:id`: Get a single subject by its ID.
*   `POST /`: Create a new subject.
*   `PUT /:id`: Update an existing subject.
*   `DELETE /:id`: Delete a subject.

### Departments (`/api/departments`)
*   `GET /`: Get a paginated list of departments.
    *   **Query Params:** `page`, `limit`, `search` (searches name and code).
*   `GET /:id`: Get a single department by its ID.
*   `POST /`: Create a new department.
*   `PUT /:id`: Update an existing department.
*   `DELETE /:id`: Delete a department.

---

## 🚀 6. Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Neon database account.

### Installation
```bash
git clone <repository-url>
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
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Tablawy&fontSize=50&fontColor=ffffff&fontAlign=50" alt="Tablawy Signature" width="100%" />
</div>
