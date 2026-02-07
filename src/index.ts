import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";
import usersRouter from "./routes/users";
import classesRouter from "./routes/classes";
import enrollmentsRouter from "./routes/enrollments";
import authRouter from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.FRONTEND_URL) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: FRONTEND_URL environment variable is not set.");
  } else {
    console.warn("Warning: FRONTEND_URL is not set. CORS may not work correctly with credentials.");
  }
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(cookieParser());

// --- Better Auth Handler ---
// This must be mounted BEFORE express.json() as per the documentation.
// It handles all requests to /api/auth/*
app.all("/api/auth/*splat", authRouter);

// --- Other Routes ---
app.use(express.json()); // This should come after the auth handler

app.use("/api/subjects", subjectsRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/enrollments", enrollmentsRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("Classroom Backend API is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
