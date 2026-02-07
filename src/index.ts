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
  // In production, it's critical to have a FRONTEND_URL for credentialed CORS requests.
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: FRONTEND_URL environment variable is not set.");
  } else {
    // In development, a warning might be sufficient.
    console.warn(
      "Warning: FRONTEND_URL is not set. CORS may not work correctly with credentials.",
    );
  }
}
// Middleware
// Enable CORS for all origins (Good for development)
// For production, use: app.use(cors({ origin: 'http://your-frontend-domain.com' }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser()); // Add cookie-parser middleware

// Routes
app.use("/api/auth", authRouter); // Mount the Better Auth handler
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
