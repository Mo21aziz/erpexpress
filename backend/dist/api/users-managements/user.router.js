"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = __importDefault(require("../../lib/container"));
console.log("User router loaded"); // Debug log
const router = express_1.default.Router();
// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`User router: ${req.method} ${req.path}`);
    next();
});
console.log("Registering route: GET /");
// Get all users
router.get("/", async (req, res) => {
    console.log("GET /api/users route hit"); // Debug log
    try {
        const users = await container_1.default.UserService.getAllUsers(req.query);
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get all users (for Gerant assignment)
console.log("Registering route: GET /employees");
router.get("/employees", async (req, res) => {
    try {
        const employees = await container_1.default.UserService.getAllEmployees();
        res.status(200).json(employees);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get Gerant's assigned employees
console.log("Registering route: GET /gerant/:id/employees");
router.get("/gerant/:id/employees", async (req, res) => {
    try {
        const employees = await container_1.default.UserService.getGerantAssignedEmployees(req.params.id);
        res.status(200).json(employees);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get paginated users
console.log("Registering route: GET /paginated");
router.get("/paginated", async (req, res) => {
    try {
        const result = await container_1.default.UserService.getPaginatedUsers(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Count users
console.log("Registering route: GET /count");
router.get("/count", async (req, res) => {
    try {
        const count = await container_1.default.UserService.countUsers(req.query);
        res.status(200).json({ count });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create user
console.log("Registering route: POST /");
router.post("/", async (req, res) => {
    console.log("POST /api/users route hit"); // Debug log
    console.log("Request body:", req.body); // Debug log
    try {
        const user = await container_1.default.UserService.createUser(req.body);
        console.log("User created:", user); // Debug log
        res.status(201).json(user);
    }
    catch (error) {
        console.error("Error creating user:", error); // Debug log
        res.status(400).json({ error: error.message });
    }
});
// Get user by condition (search/filter)
console.log("Registering route: POST /search");
router.post("/search", async (req, res) => {
    try {
        const user = await container_1.default.UserService.getUserByCondition(req.body);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get user with role - PUT THIS BEFORE /:id route
console.log("Registering route: GET /:id/with-role");
router.get("/:id/with-role", async (req, res) => {
    try {
        const user = await container_1.default.UserService.getUserWithRole(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get single user by ID
console.log("Registering route: GET /:id");
router.get("/:id", async (req, res) => {
    try {
        const user = await container_1.default.UserService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update user
console.log("Registering route: PUT /:id");
router.put("/:id", async (req, res) => {
    console.log("PUT /api/users/:id route hit"); // Debug log
    console.log("Request body:", req.body); // Debug log
    console.log("User ID:", req.params.id); // Debug log
    try {
        const user = await container_1.default.UserService.updateUser(req.params.id, req.body);
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error updating user:", error); // Debug log
        res.status(400).json({ error: error.message });
    }
});
// Delete user
console.log("Registering route: DELETE /:id");
router.delete("/:id", async (req, res) => {
    console.log("DELETE /api/users/:id route hit"); // Debug log
    console.log("User ID to delete:", req.params.id); // Debug log
    try {
        const user = await container_1.default.UserService.deleteUser(req.params.id);
        console.log("User deleted successfully:", user); // Debug log
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error deleting user:", error); // Debug log
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        // Provide more specific error messages
        if (error.code === "P2003") {
            return res.status(400).json({
                error: "Cannot delete user: User has related records that prevent deletion. Please remove related data first.",
            });
        }
        if (error.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
