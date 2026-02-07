import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";
import usersRouter from "./routes/users";
import classesRouter from "./routes/classes";
import enrollmentsRouter from "./routes/enrollments";
import betterAuthRouter from "./routes/auth"; // better-auth's own handler
import authActionsRouter from "./routes/auth-actions"; // Our custom BFF routes

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
// This handles internal better-auth routes (e.g., for social sign-on callbacks)
app.all("/api/auth/*splat", betterAuthRouter);

// --- Our Custom Auth Actions (BFF) ---
// This must come after the auth handler and use express.json()
app.use(express.json());
app.use("/api", authActionsRouter);


// --- Other API Routes ---
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
