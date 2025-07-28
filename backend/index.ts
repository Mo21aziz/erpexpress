import "dotenv/config";
import express, { Request, Response } from "express";
import connect from "./api/auth/connect";
import categoryRouter from "./api/category/cat.management";
import articleRouter from "./api/category/article.management";

let userRouter: any;
let roleRouter: any;

try {
  const userRouterModule = await import("./api/users-managements/user.router");
  userRouter = userRouterModule.default;
} catch (error) {}

try {
  const roleRouterModule = await import("./api/users-managements/role.router");
  roleRouter = roleRouterModule.default;
} catch (error) {}

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Hello from Express with TypeScript!",
    status: "success",
  });
});

app.get("/test", (req: Request, res: Response) => {
  res.json({ message: "Server is working!" });
});

app.use("/api/auth", connect);
app.use("/api/category", categoryRouter);
app.use("/api/articles", articleRouter);

const isExpressRouter = (router: any) =>
  router &&
  typeof router === "function" &&
  router.stack &&
  Array.isArray(router.stack);

if (isExpressRouter(userRouter)) {
  app.use("/api/users", userRouter);
}
if (isExpressRouter(roleRouter)) {
  app.use("/api/roles", roleRouter);
}

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.originalUrl,
  });
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT);
