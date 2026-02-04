import express from "express";
import "dotenv/config";
import subjectsRouter from "./routes/subjects";
import departmentsRouter from "./routes/departments";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
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
