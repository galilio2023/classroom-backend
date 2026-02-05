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

## 🗄️ 3. Database Schema

The database schema is defined in `src/db/schema/`. It consists of two primary tables:

*   **`departments`**: Stores academic departments (e.g., Computer Science, Mathematics).
*   **`subjects`**: Stores individual subjects (e.g., Intro to Programming). It has a **many-to-one relationship** with `departments` via the `departmentId` foreign key.

This structure allows each subject to belong to exactly one department.

---

## 🔄 4. The Data Flow: How a Request is Processed

Understanding the lifecycle of an API request is crucial. Here is what happens when the frontend requests a list of subjects with a search filter.

<details>
  <summary><strong>Scenario: `GET /api/subjects?search=math&page=1`</strong></summary>
  <br />
  <ol>
    <li><strong>Request Received:</strong> The Express server receives the incoming HTTP request.</li>
    <li><strong>Routing:</strong> The request is routed to the <code>GET /</code> handler in <code>src/routes/subjects.ts</code>.</li>
    <li><strong>Parameter Extraction:</strong> The code destructures the query string to get the <code>search</code>, <code>page</code>, and <code>limit</code> parameters:
        <pre><code>const { search, page = 1, limit = 10 } = req.query;</code></pre>
    </li>
    <li><strong>Drizzle Query Building:</strong>
        <ul>
            <li>The backend dynamically builds a set of filter conditions. If <code>search</code> exists, it creates an <code>ilike</code> condition for both the subject <code>name</code> and <code>code</code>.</li>
            <li>It uses Drizzle's <code>count()</code> function to perform an efficient query to get the total number of matching records for pagination.</li>
            <li>It then builds the main query to select the subjects, applying the <code>where</code>, <code>limit</code>, and <code>offset</code> clauses.</li>
        </ul>
    </li>
    <li><strong>SQL Execution:</strong> Drizzle ORM translates the query object into raw, parameterized SQL and sends it to the Neon database via the <code>neon-http</code> driver.
        <pre><code class="lang-sql">-- (Simplified) Example SQL for the count
SELECT count(*) FROM "subjects" WHERE "name" ILIKE '%math%' OR "code" ILIKE '%math%';

-- (Simplified) Example SQL for the data
SELECT ... FROM "subjects" WHERE ... LIMIT 10 OFFSET 0;</code></pre>
    </li>
    <li><strong>Response Formatting:</strong> The backend receives the data from the database and formats it into the specific JSON structure the frontend expects, including the <code>data</code> array and the <code>pagination</code> object.</li>
    <li><strong>Response Sent:</strong> The server sends the JSON object back to the frontend with a <code>200 OK</code> status code.</li>
  </ol>
</details>

---

## 🔌 5. API Endpoints

### Subjects (`/api/subjects`)

<details>
  <summary><code>GET /</code> - Get a paginated list of subjects</summary>
  <br />
  <ul>
    <li><strong>Query Params:</strong>
        <ul>
            <li><code>page</code> (number, optional, default: 1)</li>
            <li><code>limit</code> (number, optional, default: 10)</li>
            <li><code>search</code> (string, optional): Searches <code>name</code> and <code>code</code> fields.</li>
            <li><code>department</code> (string, optional): Searches by department <code>name</code>.</li>
        </ul>
    </li>
    <li><strong>Success Response (200):</strong>
        <pre><code class="lang-json">{
  "data": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Programming",
      "department": { "id": 1, "name": "Computer Science", ... }
    }
  ],
  "pagination": { "page": 1, "totalPages": 1, "total": 1, ... }
}</code></pre>
    </li>
  </ul>
</details>

<details>
  <summary><code>GET /:id</code> - Get a single subject by its ID</summary>
  <br />
  <ul>
    <li><strong>Success Response (200):</strong>
        <pre><code class="lang-json">{
  "id": 1,
  "code": "CS101",
  "name": "Introduction to Programming",
  "department": { "id": 1, "name": "Computer Science", ... }
}</code></pre>
    </li>
  </ul>
</details>

<details>
  <summary><code>POST /</code> - Create a new subject</summary>
  <br />
  <ul>
    <li><strong>Request Body:</strong>
        <pre><code class="lang-json">{
  "code": "PHY201",
  "name": "Quantum Mechanics",
  "description": "An introduction to quantum theory.",
  "departmentId": 3
}</code></pre>
    </li>
    <li><strong>Success Response (201):</strong> Returns the newly created subject object.</li>
  </ul>
</details>

<details>
  <summary><code>PUT /:id</code> - Update an existing subject</summary>
  <br />
  <ul>
    <li><strong>Request Body:</strong> (Include only the fields you want to change)
        <pre><code class="lang-json">{
  "name": "Advanced Quantum Mechanics",
  "description": "A deeper dive into quantum theory."
}</code></pre>
    </li>
    <li><strong>Success Response (200):</strong> Returns the updated subject object.</li>
  </ul>
</details>

<details>
  <summary><code>DELETE /:id</code> - Delete a subject</summary>
  <br />
  <ul>
    <li><strong>Success Response (200):</strong>
        <pre><code class="lang-json">{ "message": "Subject deleted successfully" }</code></pre>
    </li>
  </ul>
</details>

### Departments (`/api/departments`)
*(Follows a similar CRUD structure to Subjects)*

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
    <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Tablawy&fontSize=50&fontColor=ffffff&fontAlign=50" alt="Tablawy Signature" width="100%" />
  </a>
</div>
