import express from "express";
import container from "../../lib/container";
console.log("Role router loaded"); // Debug log
const router = express.Router();
// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`Role router: ${req.method} ${req.path}`);
    next();
});
console.log("Registering route: GET /");
// Get all roles
router.get("/", async (req, res) => {
    console.log("GET /api/roles route hit"); // Debug log
    try {
        const roles = await container.RoleService.getAllRoles(req.query);
        res.status(200).json(roles);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
console.log("Registering route: GET /paginated");
// Get paginated roles
router.get("/paginated", async (req, res) => {
    try {
        const result = await container.RoleService.getPaginatedRoles(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
console.log("Registering route: GET /count");
// Count roles
router.get("/count", async (req, res) => {
    try {
        const count = await container.RoleService.countRoles(req.query);
        res.status(200).json({ count });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
console.log("Registering route: POST /");
// Create role - PUT THIS BEFORE /:id routes
router.post("/", async (req, res) => {
    console.log("POST /api/roles route hit"); // Debug log
    console.log("Request body:", req.body); // Debug log
    console.log("Request headers:", req.headers); // Debug log
    try {
        const role = await container.RoleService.createRole(req.body);
        res.status(201).json(role);
    }
    catch (error) {
        console.error("Error creating role:", error); // Debug log
        res.status(400).json({ error: error.message });
    }
});
console.log("Registering route: GET /:id");
// Get single role by ID
router.get("/:id", async (req, res) => {
    try {
        const role = await container.RoleService.getRoleById(req.params.id);
        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }
        res.status(200).json(role);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
console.log("Registering route: PUT /:id");
// Update role
router.put("/:id", async (req, res) => {
    try {
        const role = await container.RoleService.updateRole(req.params.id, req.body);
        res.status(200).json(role);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
console.log("Registering route: POST /:id/duplicate");
// Duplicate role
router.post("/:id/duplicate", async (req, res) => {
    try {
        const role = await container.RoleService.duplicateRole(req.params.id);
        res.status(201).json(role);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
console.log("Registering route: DELETE /:id");
// Delete role (soft delete)
router.delete("/:id", async (req, res) => {
    try {
        const role = await container.RoleService.deleteRole(req.params.id);
        res.status(200).json(role);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
