import express, { Request, Response } from "express";
import container from "../../lib/container";

const router = express.Router();

router.post("/connect", async (req: Request, res: Response) => {
  const authService = container.AuthService;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const data = await authService.connect({ email, password });

    res.status(200).json({ message: "Connection successful", code: 200, data });
  } catch (error: any) {
    res.status(401).json({ error: error.message, code: 401 });
  }
});

export default router;
