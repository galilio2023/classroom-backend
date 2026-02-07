import express from "express";
import cors from "cors";
import "dotenv/config";
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";
import usersRouter from "./routes/users";
import classesRouter from "./routes/classes";
import enrollmentsRouter from "./routes/enrollments";
import betterAuthRouter from "./routes/auth";
import authActionsRouter from "./routes/auth-actions";
import { protect } from "./middleware/protect";

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.FRONTEND_URL) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: FRONTEND_URL environment variable is not set.");
  } else {
    console.warn("Warning: FRONTEND_URL is not set. CORS may not work correctly with credentials.");
  }
}

// --- Global Middleware ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
// Apply express.json() globally before all routes
app.use(express.json()); 

// --- Route Handlers ---

// Better Auth's Internal Handler
app.all("/api/auth/*splat", betterAuthRouter);

// Our Custom Auth Actions (BFF)
app.use("/api", authActionsRouter);

// Protected API Routes
app.use("/api/subjects", protect, subjectsRouter);
app.use("/api/departments", protect, departmentsRouter);
app.use("/api/users", protect, usersRouter);
app.use("/api/classes", protect, classesRouter);
app.use("/api/enrollments", protect, enrollmentsRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("Classroom Backend API is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
