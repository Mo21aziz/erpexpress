import express, { Request, Response } from "express";
import container from "../../lib/container";

const router = express.Router();

router.post("/connect", async (req: Request, res: Response) => {
  const authService = container.AuthService;
  try {
    const { username, password } = req.body;
    console.log("Connect route received:", {
      username,
      password: password ? "***" : "missing",
    });

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const data = await authService.connect({ username, password });

    res.status(200).json({ message: "Connection successful", code: 200, data });
  } catch (error: any) {
    console.error("Connect error:", error);
    res.status(401).json({ error: error.message, code: 401 });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  const authService = container.AuthService;
  try {
    const { username, email, password, role_id } = req.body;
    console.log("Register route received:", { username, email, role_id });

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email and password are required" });
    }

    const user = await authService.register({
      username,
      email,
      password,
      role_id,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", code: 201, data: user });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(400).json({ error: error.message, code: 400 });
  }
});

export default router;
