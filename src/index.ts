import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

// Health Check
app.get("/", (req, res) => {
  res.send("Classroom Backend API is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
