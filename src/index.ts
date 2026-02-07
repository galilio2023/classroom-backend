import "dotenv/config"; // Must be at the very top
import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";

import subjectsRouter from "./routes/subjects";
import usersRouter from "./routes/users";
import classesRouter from "./routes/classes";
import departmentsRouter from "./routes/departments";
import enrollmentsRouter from "./routes/enrollments";
import { auth } from "./lib/auth";
import { protect } from "./middleware/protect";

// --- Environment Variable Validation ---
const requiredEnvVars = ["FRONTEND_URL", "BETTER_AUTH_SECRET", "DATABASE_URL"];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`FATAL: Environment variable ${varName} is not set.`);
  }
}

const app = express();
const PORT = process.env.PORT || 8000;

// Global Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// --- Route Handlers ---

// Better Auth's self-contained handler for /api/auth/* routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// Application API routes are now protected
app.use("/api/subjects", protect, subjectsRouter);
app.use("/api/users", protect, usersRouter);
app.use("/api/classes", protect, classesRouter);
app.use("/api/departments", protect, departmentsRouter);
app.use("/api/enrollments", protect, enrollmentsRouter);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
