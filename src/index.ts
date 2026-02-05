import express from "express";
import cors from "cors";
import "dotenv/config";
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";

const app = express();
const PORT = process.env.PORT || 8000;

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

// Routes
app.use("/api/subjects", subjectsRouter);
app.use("/api/departments", departmentsRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("Classroom Backend API is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
