import 'dotenv/config';
import express, { Request, Response } from "express";
import connect from "./api/auth/connect";

const app = express();
const PORT = 5000;

console.log("DATABASE_URL:", process.env.DATABASE_URL); // Debug line

// Middleware
app.use(express.json());

// Routes
app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Hello from Express with TypeScript!",
    status: "success",
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use("/api/auth", connect);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
