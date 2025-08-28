import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { CorsOptions } from "cors";
import connect from "./api/auth/connect";
import categoryRouter from "./api/category/cat.management";
import articleRouter from "./api/category/article.management";
import orderRouter from "./api/orders/order.management";
import bonDeCommandeRouter from "./api/bon-de-commande.management";

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

// Enable CORS
const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"], // Vite dev server and potential other ports
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

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

// Debug endpoint to check users
app.get("/api/debug/users", async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    await prisma.$disconnect();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error });
  }
});

// Debug endpoint to check roles
app.get("/api/debug/roles", async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    await prisma.$disconnect();
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles", details: error });
  }
});

// Setup endpoint to create default role and test user
app.post("/api/debug/setup", async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Create default role if it doesn't exist
    let defaultRole = await prisma.role.findFirst({
      where: { name: "USER" },
    });

    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: { name: "USER" },
      });
    }

    // Create test user if it doesn't exist
    let testUser = await prisma.user.findFirst({
      where: { email: "test@example.com" },
    });

    if (!testUser) {
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash("password123", 10);

      testUser = await prisma.user.create({
        data: {
          username: "testuser",
          email: "test@example.com",
          password: hashedPassword,
          role_id: defaultRole.id,
        },
      });
    }

    await prisma.$disconnect();
    res.json({
      message: "Setup completed",
      defaultRole,
      testUser: {
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to setup", details: error });
  }
});

// Seed roles endpoint
app.post("/api/debug/seed-roles", async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const roles = [
      { name: "Responsible" },
      { name: "Admin" },
      { name: "Employee" },
      { name: "Gerant" },
    ];

    const createdRoles: { id: string; name: string }[] = [];
    for (const role of roles) {
      const createdRole = await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: { name: role.name },
      });
      createdRoles.push(createdRole);
    }

    await prisma.$disconnect();
    res.json({
      message: "Roles seeded successfully",
      roles: createdRoles,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to seed roles", details: error });
  }
});

app.use("/api/auth", connect);
app.use("/api/category", categoryRouter);
app.use("/api/articles", articleRouter);
app.use("/api/orders", orderRouter);
app.use("/api/bon-de-commande", bonDeCommandeRouter);

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
