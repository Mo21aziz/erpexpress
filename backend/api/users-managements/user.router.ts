import express, { Request, Response } from "express";
import container from "../../lib/container";

console.log("User router loaded"); // Debug log

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`User router: ${req.method} ${req.path}`);
  next();
});

console.log("Registering route: GET /");
// Get all users
router.get("/", async (req: Request, res: Response) => {
  console.log("GET /api/users route hit"); // Debug log
  try {
    const users = await container.UserService.getAllUsers(req.query);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for Gerant assignment)
console.log("Registering route: GET /employees");
router.get("/employees", async (req: Request, res: Response) => {
  try {
    const employees = await container.UserService.getAllEmployees();
    res.status(200).json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Gerant's assigned employees
console.log("Registering route: GET /gerant/:id/employees");
router.get("/gerant/:id/employees", async (req: Request, res: Response) => {
  try {
    const employees = await container.UserService.getGerantAssignedEmployees(
      req.params.id
    );
    res.status(200).json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get paginated users
console.log("Registering route: GET /paginated");
router.get("/paginated", async (req: Request, res: Response) => {
  try {
    const result = await container.UserService.getPaginatedUsers(req.query);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Count users
console.log("Registering route: GET /count");
router.get("/count", async (req: Request, res: Response) => {
  try {
    const count = await container.UserService.countUsers(req.query);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
console.log("Registering route: POST /");
router.post("/", async (req: Request, res: Response) => {
  console.log("POST /api/users route hit"); // Debug log
  console.log("Request body:", req.body); // Debug log
  try {
    const user = await container.UserService.createUser(req.body);
    console.log("User created:", user); // Debug log
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creating user:", error); // Debug log
    res.status(400).json({ error: error.message });
  }
});

// Get user by condition (search/filter)
console.log("Registering route: POST /search");
router.post("/search", async (req: Request, res: Response) => {
  try {
    const user = await container.UserService.getUserByCondition(req.body);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user with role - PUT THIS BEFORE /:id route
console.log("Registering route: GET /:id/with-role");
router.get("/:id/with-role", async (req: Request, res: Response) => {
  try {
    const user = await container.UserService.getUserWithRole(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user by ID
console.log("Registering route: GET /:id");
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await container.UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
console.log("Registering route: PUT /:id");
router.put("/:id", async (req: Request, res: Response) => {
  console.log("PUT /api/users/:id route hit"); // Debug log
  console.log("Request body:", req.body); // Debug log
  console.log("User ID:", req.params.id); // Debug log
  try {
    const user = await container.UserService.updateUser(
      req.params.id,
      req.body
    );
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error updating user:", error); // Debug log
    res.status(400).json({ error: error.message });
  }
});

// Delete user
console.log("Registering route: DELETE /:id");
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = await container.UserService.deleteUser(req.params.id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
