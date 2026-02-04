import express, { Request, Response } from "express";

const app = express();
const PORT = 8000;

// Middleware to parse JSON
app.use(express.json());

// Root GET route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello ,welcome to the classroom API!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
